package com.example.chatapplication;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.Part;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.sql.*;

@ServerEndpoint("/LiveChat/{sender_id}")
@MultipartConfig
public class WebSocketServer  {
    private static final Map<String, Session> userSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("sender_id") String sender_id) {
        userSessions.put(sender_id, session);
        System.out.println("New connection: " + sender_id);
    }


    @OnMessage
    public void onMessage(String message, @PathParam("sender_id") String sender_id, Session session) throws IOException {
        //   System.out.println(Arrays.toString(message));

        JSONObject msg = new JSONObject(message);
        String msgType = msg.getString("type");
        String dataFormat = msg.getString("dataFormat");

        if (msgType.equals("Private")) {
            JSONObject jsonResponse = new JSONObject();
            String receiver_id = msg.getString("receiver_id");
            ;
            if (dataFormat.equals("Text")) {
                String message_text = msg.getString("ciphertext");
                String iv = msg.getString("iv");
                String aeskey_receiver = msg.getString("aeskeyReceiver");
                String aeskey_sender = msg.getString("aeskeySender");
                storeMessage(sender_id, receiver_id, message_text, iv, aeskey_receiver, aeskey_sender);
                jsonResponse.put("dataFormat", "Text");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("message", message_text);
                jsonResponse.put("iv", iv);
                jsonResponse.put("aes_key_receiver", aeskey_receiver);
                jsonResponse.put("aes_key_sender", aeskey_sender);

            } else {

                String file_name = msg.getString("file_name");
                String sender_name = msg.getString("sender_name");
                storeFiles(file_name, sender_id, receiver_id);
                jsonResponse.put("dataFormat", "Sticker");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("file_name", file_name);
                jsonResponse.put("sender_name", sender_name);
            }
            Session receiverSession = userSessions.get(receiver_id);
            if (receiverSession != null && receiverSession.isOpen()) {

                receiverSession.getBasicRemote().sendText(jsonResponse.toString());
            }

        } else {
            String grp_id = msg.getString("grp_id");
            String sender_name = msg.getString("sender_name");

            if (dataFormat.equals("Text")) {
                JSONArray members_aesKey = msg.getJSONArray("members_aesKey");
                String message_text = msg.getString("ciphertext");
                String msg_iv = msg.getString("iv");
                Map<String, String> memberaesKeyMap = new HashMap<>();
                for (int i = 0; i < members_aesKey.length(); i++) {
                    JSONObject obj = members_aesKey.getJSONObject(i);
                    String userId = obj.getString("user_id");
                    String key = obj.getString("encryptedAESKey");
                    memberaesKeyMap.put(userId, key);
                }
                sendMessageToGroup(grp_id, message_text, msg_iv, memberaesKeyMap, sender_id, sender_name);
                storeGroupMessage(grp_id, sender_id, message_text, msg_iv, memberaesKeyMap);
            } else {
                String file_name = msg.getString("file_name");
                storeFiles(file_name, sender_id, grp_id);
                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("dataFormat", "Sticker");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("file_name", file_name);
                jsonResponse.put("sender_name", sender_name);
                Connection con =DBconnection.getConnection();
                PreparedStatement ps=null;
                ResultSet rs=null;
                if(con!=null){
                    String qryforgrpMember="select * from group_members where grp_id=? and user_id!=?";
                    try{
                        ps=con.prepareStatement(qryforgrpMember);
                        ps.setString(1, grp_id);
                        ps.setString(2, sender_id);
                        rs=ps.executeQuery();
                        while(rs.next()){
                            Session receiverSession = userSessions.get(rs.getString("user_id"));
                            if(receiverSession != null && receiverSession.isOpen()) {
                                receiverSession.getBasicRemote().sendText(jsonResponse.toString());
                            }

                        }

                    }catch (SQLException e){
                        e.printStackTrace();
                    }
                }

            }

        }






    }



    @OnClose
    public void onClose(Session session, @PathParam("sender_id") String sender_id) {
        userSessions.remove(sender_id);
        System.out.println("Connection closed: " + sender_id);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("Error: " + throwable.getMessage());
    }

    private void storeMessage(String sender_id, String receiver_id, String message,String iv, String aeskey_receiver, String aeskey_sender) {
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con != null) {
            String qry= "insert into messages (mess_id, send_id, receiver_id, message, iv, aes_key_receiver,aes_key_sender) values (?,?,?,?,?,?,?)";
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1,IdGeneration.generateRandomID());
                ps.setString(2,sender_id);
                ps.setString(3,receiver_id);
                ps.setString(4,message);
                ps.setString(5,iv);
                ps.setString(6,aeskey_receiver);
                ps.setString(7,aeskey_sender);

                int rowinsert =ps.executeUpdate();
                if(rowinsert > 0) {
                    System.out.println("Message inserted successfully");
                }
                else{
                    System.out.println("Message insert failed");
                }

            }catch ( SQLException e){
                e.printStackTrace();

            }
        }
        else{
            System.out.println("Connection failed");
        }


    }
    private void  sendMessageToGroup(String grp_id,String message,String msg_iv,Map<String,String> memberaesKeyMap, String sender_id,String sender_name) throws IOException {

        System.out.println(memberaesKeyMap.size());

        for (Map.Entry<String, String> entry : memberaesKeyMap.entrySet()) {
            String member_id = entry.getKey();
            String key = entry.getValue();
            Session receiverSession = userSessions.get(member_id);
            if(receiverSession != null && receiverSession.isOpen() && !member_id.equals(sender_id)) {
                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("dataFormat", "Text");
                jsonResponse.put("grp_id", grp_id);
                jsonResponse.put("member_id", member_id);
                jsonResponse.put("sender_id",sender_id);
                jsonResponse.put("message",message);
                jsonResponse.put("iv",msg_iv);
                jsonResponse.put("aes_key_receiver",key);
                jsonResponse.put("sender_name",sender_name);
                receiverSession.getBasicRemote().sendText(jsonResponse.toString());

            }
        }


    }

    private void storeGroupMessage(String grp_id,String sender_id,String message_text,String msg_iv,Map<String,String> memberaesKeyMap){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con != null) {
            String qryForInsert= "insert into group_messages (grpmssg_id,grp_id,sender_id,message,msg_iv) values (?,?,?,?,?)";
            String qryAesKey ="insert into  aes_keys (key_id,grpmssg_id,grp_id,receiver_id,enc_aes_key) values (?,?,?,?,?)";
            try{
                String grp_msg_id=IdGeneration.generateRandomID();
                ps = con.prepareStatement(qryForInsert);
                ps.setString(1,grp_msg_id);
                ps.setString(2,grp_id);
                ps.setString(3,sender_id);
                ps.setString(4,message_text);
                ps.setString(5,msg_iv);


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


            }catch ( SQLException e){
                e.printStackTrace();

            }
        }
        else{
            System.out.println("Connection failed");
        }

    }
    private void storeFiles(String file_name,String sender_id,String receiver_id){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con != null) {
            String qryFroFile ="insert into files (file_id,sender_id,receiver_id,file_name) values (?,?,?,?)";
            try{
                ps = con.prepareStatement(qryFroFile);
                ps.setString(1,IdGeneration.generateRandomID());
                ps.setString(2,sender_id);
                ps.setString(3,receiver_id);
                ps.setString(4,file_name);
                int rowinsert =ps.executeUpdate();
                if(rowinsert > 0) {
                    System.out.println("File inserted successfully");
                }
                else{
                    System.out.println("File insert failed");
                }

            }catch (SQLException e){
                e.printStackTrace();

            }
        }


    }


}


