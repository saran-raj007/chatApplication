package com.example.chatapplication;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.sql.*;
import java.util.*;

import jakarta.websocket.Session;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/MessageHandle")
public class MessageHanlingServlet extends HttpServlet {
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            response.setContentType("application/json");
            String sender_id =UserSessionGenerate.validateToken(request);
            if (sender_id != null) {
                JsonObject msg = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
                //JSONObject msg = new JSONObject(message);
                String msgType = msg.get("type").getAsString();
                String dataFormat = msg.get("dataFormat").getAsString();

                if (msgType.equals("Private")) {
                    JSONObject jsonResponse = new JSONObject();
                    String receiver_id = msg.get("receiver_id").getAsString();
                    String msg_id=null;
                        String message_text = msg.get("ciphertext").getAsString();
                        String iv = msg.get("iv").getAsString();
                        String aeskey_receiver = msg.get("aeskeyReceiver").getAsString();
                        String aeskey_sender = msg.get("aeskeySender").getAsString();
                        jsonResponse.put("dataFormat", "Text");
                        jsonResponse.put("sender_id", sender_id);
                        jsonResponse.put("message", message_text);
                        jsonResponse.put("iv", iv);
                        jsonResponse.put("aes_key_receiver", aeskey_receiver);
                        jsonResponse.put("aes_key_sender", aeskey_sender);
                        msg_id=storeMessage(sender_id, receiver_id, message_text, iv, aeskey_receiver, aeskey_sender);
                        jsonResponse.put("mess_id", msg_id);
                        WebSocketServer.sendMessageToPvt(receiver_id,sender_id,jsonResponse);

                }
                else {
                    String grp_id = msg.get("grp_id").getAsString();
                    String sender_name = msg.get("sender_name").getAsString();
                    JsonArray members_aesKey = msg.getAsJsonArray("members_aesKey");
                    String message_text = msg.get("ciphertext").getAsString();
                    String msg_iv = msg.get("iv").getAsString();
                    Map<String, String> memberaesKeyMap = new HashMap<>();
                    for (JsonElement keyElement : members_aesKey) {
                        JsonObject keyObject = keyElement.getAsJsonObject();
                        Iterator<Map.Entry<String, JsonElement>> iterator = keyObject.entrySet().iterator();

                        if (iterator.hasNext()) {
                            String id = iterator.next().getValue().getAsString();
                            if (iterator.hasNext()) {
                                String key = iterator.next().getValue().getAsString();
                                memberaesKeyMap.put(id, key);
                            }
                        }
                    }
                    String msg_id=storeGroupMessage(grp_id, sender_id, message_text, msg_iv, memberaesKeyMap);
                    WebSocketServer.sendMessageToGroup(grp_id,msg_id, message_text, msg_iv, memberaesKeyMap, sender_id, sender_name,null,null,false);




                }

            }
        }



        private String storeMessage(String sender_id, String receiver_id, String message,String iv, String aeskey_receiver, String aeskey_sender) {
            Connection con = DBconnection.getConnection();
            PreparedStatement ps = null;
            if(con != null) {
                String qry= "insert into messages (mess_id, send_id, receiver_id, message, iv, aes_key_receiver,aes_key_sender,isforward) values (?,?,?,?,?,?,?,?)";
                try{
                    ps = con.prepareStatement(qry);
                    String msg_id=IdGeneration.generateRandomID();
                    ps.setString(1,msg_id);
                    ps.setString(2,sender_id);
                    ps.setString(3,receiver_id);
                    ps.setString(4,message);
                    ps.setString(5,iv);
                    ps.setString(6,aeskey_receiver);
                    ps.setString(7,aeskey_sender);
                    ps.setBoolean(8,false);


                    int rowinsert =ps.executeUpdate();
                    if(rowinsert > 0) {
                        System.out.println("Message inserted successfully");
                    }
                    else{
                        System.out.println("Message insert failed");
                    }
                    return msg_id;

                }catch ( SQLException e){
                    e.printStackTrace();

                }
            }
            else{
                System.out.println("Connection failed");
            }
            return null;


        }


        private String storeGroupMessage(String grp_id,String sender_id,String message_text,String msg_iv,Map<String,String> memberaesKeyMap){
            Connection con = DBconnection.getConnection();
            PreparedStatement ps = null;
            if(con != null) {
                String qryForInsert= "insert into group_messages (grpmssg_id,grp_id,sender_id,message,msg_iv,isforward) values (?,?,?,?,?,?)";
                String qryAesKey ="insert into  aes_keys (key_id,grpmssg_id,grp_id,receiver_id,enc_aes_key) values (?,?,?,?,?)";
                try{
                    String grp_msg_id=IdGeneration.generateRandomID();
                    ps = con.prepareStatement(qryForInsert);
                    ps.setString(1,grp_msg_id);
                    ps.setString(2,grp_id);
                    ps.setString(3,sender_id);
                    ps.setString(4,message_text);
                    ps.setString(5,msg_iv);
                    ps.setBoolean(6,false);


                    int rowinsert =ps.executeUpdate();
                    if(rowinsert > 0) {
                        System.out.println("Message inserted successfully");
                    }
                    else{
                        System.out.println("Message insert failed");
                    }
                    ps = con.prepareStatement(qryAesKey);
                    for(Map.Entry<String, String> entry : memberaesKeyMap.entrySet()) {
                        ps.setString(1,IdGeneration.generateRandomID());
                        ps.setString(2,grp_msg_id);
                        ps.setString(3,grp_id);
                        ps.setString(4,entry.getKey());
                        ps.setString(5,entry.getValue());
                        rowinsert =ps.executeUpdate();
                        if(rowinsert > 0) {
                            System.out.println("Message inserted successfully");
                        }
                        else{
                            System.out.println("Message insert failed");
                        }

                    }
                    return grp_msg_id;


                }catch ( SQLException e){
                    e.printStackTrace();

                }
            }
            else{
                System.out.println("Connection failed");
            }
            return null;


        }

}
