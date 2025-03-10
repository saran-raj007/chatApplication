package com.example.chatapplication;


import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStreamReader;
import java.sql.*;
import java.util.*;
import org.json.JSONObject;

@WebServlet("/ForwardMessage")
public class ForwardMessage extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        JSONObject responseObject = new JSONObject();
        if(sender_id != null){
            JsonArray jsonArray = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonArray();
            for (JsonElement element : jsonArray) {
                JsonObject messageObject = element.getAsJsonObject();

                String oldMsgId = messageObject.get("old_msgid").getAsString();
                String oldSenderId = messageObject.get("old_sender_id").getAsString();

                String dataFormat = messageObject.get("dataFormat").getAsString();

                if(dataFormat.equals("Text")){
                    String message = messageObject.get("message").getAsString();
                    String iv = messageObject.get("iv").getAsString();
//                    System.out.println("Message ID: " + oldMsgId);
//                    System.out.println("Sender ID: " + oldSenderId);
//                    System.out.println("Message: " + message);
//                    System.out.println("IV: " + iv);
//                    System.out.println("Data Format: " + dataFormat);

                    JsonArray forwardToArray = messageObject.getAsJsonArray("forwardto");
                    for (JsonElement recipientElement : forwardToArray) {
                        JsonObject receiver = recipientElement.getAsJsonObject();
                        String receiverId = receiver.get("receiver_id").getAsString();
                        String type = receiver.get("type").getAsString();


                        JsonElement encKeysElement = receiver.get("enc_keys");
                        if (encKeysElement.isJsonArray() && type.equals("private")) {
                            JsonArray encKeysArray = encKeysElement.getAsJsonArray();
                            String msg_id=storeForwardpvt(sender_id,receiverId,oldSenderId,oldMsgId,message,iv,dataFormat,encKeysArray.get(0).getAsString(),encKeysArray.get(1).getAsString());
                            jsonResponse.put("messg_id", msg_id);
                            jsonResponse.put("sender_id", sender_id);
                            jsonResponse.put("receiver_id", receiverId);
                            jsonResponse.put("dataFormat", dataFormat);
                            jsonResponse.put("aes_key_receiver", encKeysArray.get(1).getAsString());
                            jsonResponse.put("aes_key_sender", encKeysArray.get(0).getAsString());
                            jsonResponse.put("isforward", true);
                            jsonResponse.put("old_msgid", oldMsgId);
                            jsonResponse.put("old_senderid", oldSenderId);
                            jsonResponse.put("message", message);
                            jsonResponse.put("iv", iv);

                            WebSocketServer.sendMessageToPvt(receiverId,sender_id,jsonResponse);
                            responseObject.put("message","forward success");
                        }
                        else if (type.equals("group")) {
                            String sender_name =messageObject.get("sender_name").getAsString();
                            JsonArray encKeysArray = receiver.getAsJsonArray("enc_keys");
                            Map<String,String> aes = new HashMap<>();
                            if (encKeysArray != null) {
                                for (JsonElement encKeyElement : encKeysArray) {
                                    JsonObject encKeyObject = encKeyElement.getAsJsonObject();
                                    for (String key : encKeyObject.keySet()) {
                                        aes.put(key,encKeyObject.get(key).getAsString());
                                    }
                                }
                                JsonArray mentions = new JsonArray();
                                String msg_id=storeForwardgrp(sender_id,receiverId,oldSenderId,oldMsgId,message,iv,dataFormat,aes);
                                WebSocketServer.sendMessageToGroup(receiverId,msg_id,message,iv,aes,sender_id,sender_name,oldSenderId,oldMsgId,true,mentions);
                            }
                            responseObject.put("message","forward success");
                        }
                    }

                }
                else{
                    String file_name =messageObject.get("file_name").getAsString();
                    String receiver_id =messageObject.get("receiver_id").getAsString();
                    boolean isGroup =messageObject.get("isGroup").getAsBoolean();
                    //String sender_name =messageObject.get("sender_name").getAsString();
                    String msg_id=FilesHandlingServlet.storeFiles(file_name,sender_id,receiver_id,isGroup,oldSenderId,oldMsgId,true);
                    jsonResponse.put("mess_id",msg_id);
                    jsonResponse.put("file_name", file_name);
                    jsonResponse.put("dataFormat", "Sticker");
                    jsonResponse.put("sender_id", sender_id);
                    jsonResponse.put("receiver_id", receiver_id);
                    if(isGroup){
                        WebSocketServer.sendFilesTogrp(receiver_id,jsonResponse);

                    }
                    else{
                        WebSocketServer.sendMessageToPvt(receiver_id,sender_id,jsonResponse);

                    }
                    responseObject.put("message","forward success");
                }


            }

        }
        else{
            responseObject.put("message","unauthorized");

        }
        response.getWriter().write(responseObject.toString());

    }
    private String storeForwardpvt(String sender_id,String receiverId,String oldSenderId,String oldMsgId,String message,String iv,String dataFormat,String encKeySender,String encKeyReceiver){
        Connection con =DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con != null){
            String qry ="insert into messages (mess_id,send_id,receiver_id,message,iv,aes_key_sender,aes_key_receiver,isforward,old_msgid,old_senderid) values (?,?,?,?,?,?,?,?,?,?)";
            String msg_id =IdGeneration.generateRandomID();
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1,msg_id);
                ps.setString(2,sender_id);
                ps.setString(3,receiverId);
                ps.setString(4,message);
                ps.setString(5,iv);
                ps.setString(6,encKeySender);
                ps.setString(7,encKeyReceiver);
                ps.setBoolean(8,true);
                ps.setString(9,oldMsgId);
                ps.setString(10,oldSenderId);
                ps.executeUpdate();
                return msg_id;

            }catch (SQLException e){
                e.printStackTrace();
            }
        }
        return null;


    }
    private String storeForwardgrp(String sender_id,String receiverId,String oldSenderId,String oldMsgId,String message,String iv,String dataFormat,Map<String,String> aes){
        Connection con =DBconnection.getConnection();
        PreparedStatement ps;
        if(con != null){
            String qry ="insert into group_messages (grpmssg_id,sender_id,grp_id,message,msg_iv,isforward,old_msgid,old_senderid) values (?,?,?,?,?,?,?,?)";
            String qrykey ="insert into aes_keys (key_id,grpmssg_id,grp_id,receiver_id,enc_aes_key) values (?,?,?,?,?)";
            String msg_id =IdGeneration.generateRandomID();
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1,msg_id);
                ps.setString(2,sender_id);
                ps.setString(3,receiverId);
                ps.setString(4,message);
                ps.setString(5,iv);
                ps.setBoolean(6,true);
                ps.setString(7,oldMsgId);
                ps.setString(8,oldSenderId);
                ps.executeUpdate();
                ps=con.prepareStatement(qrykey);

                for(Map.Entry<String,String> entry : aes.entrySet()){
                    ps.setString(1,IdGeneration.generateRandomID());
                    ps.setString(2,msg_id);
                    ps.setString(3,receiverId);
                    ps.setString(4,entry.getKey());
                    ps.setString(5,entry.getValue());
                    ps.executeUpdate();

                }
                return msg_id;


            }catch (SQLException e){
                e.printStackTrace();
            }
        }
        return null;
    }
}
