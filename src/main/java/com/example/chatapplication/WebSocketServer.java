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
    public static final Map<String, Session> userSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("sender_id") String sender_id) throws IOException {
        userSessions.put(sender_id, session);
        System.out.println("New connection: " + sender_id);
        updateStatus(sender_id,"Online");
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
                jsonResponse.put("dataFormat", "Text");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("message", message_text);
                jsonResponse.put("iv", iv);
                jsonResponse.put("aes_key_receiver", aeskey_receiver);
                jsonResponse.put("aes_key_sender", aeskey_sender);

            }
            else {

                String file_name = msg.getString("file_name");
                String sender_name = msg.getString("sender_name");
                jsonResponse.put("dataFormat", "Sticker");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("file_name", file_name);
                jsonResponse.put("sender_name", sender_name);
            }
            Session receiverSession = userSessions.get(receiver_id);
            if (receiverSession != null && receiverSession.isOpen()) {

                receiverSession.getBasicRemote().sendText(jsonResponse.toString());
            }

        }
        else {
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
               // sendMessageToGroup(grp_id, message_text, msg_iv, memberaesKeyMap, sender_id, sender_name);
            }
            else {
                String file_name = msg.getString("file_name");
                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("dataFormat", "Sticker");
                jsonResponse.put("sender_id", sender_id);
                jsonResponse.put("file_name", file_name);
                jsonResponse.put("sender_name", sender_name);




            }

        }






    }
    public static ResultSet fetchGrpMembers(String grp_id) throws SQLException {
        Connection con =DBconnection.getConnection();
        PreparedStatement ps;
        if(con!=null){
            String qryforgrpMember="select * from group_members where grp_id=?";
            ps=con.prepareStatement(qryforgrpMember);
            ps.setString(1, grp_id);
          //  ps.setString(2, sender_id);
            return ps.executeQuery();

        }
        return null;
    }
    public void updateStatus(String user_id,String status) throws IOException {
        JSONObject statusUpdate = new JSONObject();
        statusUpdate.put("dataFormat", "status_update");
        statusUpdate.put("user_id", user_id);
        statusUpdate.put("status", status);
        for(Session session : userSessions.values()){
            session.getBasicRemote().sendText(statusUpdate.toString());
        }
    }

    public static void deleteMessage(String msg_id,boolean isGroup,String request_id,String receiver_id) throws IOException {
        JSONObject deleteMessage = new JSONObject();
        deleteMessage.put("dataFormat", "delete_message");
        deleteMessage.put("msg_id", msg_id);

        if(isGroup){
            try{
                ResultSet rs=fetchGrpMembers(receiver_id);
                while(rs.next()){
                    Session receiverSession = userSessions.get(rs.getString("user_id"));
                    if(receiverSession != null && receiverSession.isOpen()) {
                        receiverSession.getBasicRemote().sendText(deleteMessage.toString());
                    }

                }
            }catch (SQLException e){
                e.printStackTrace();
            }

        }
        else{
            Session receiverSession = userSessions.get(receiver_id);
            if(receiverSession != null && receiverSession.isOpen()) {
                receiverSession.getBasicRemote().sendText(deleteMessage.toString());
            }
        }
    }



    @OnClose
    public void onClose(Session session, @PathParam("sender_id") String sender_id) throws IOException {
        userSessions.remove(sender_id);
        System.out.println("Connection closed: " + sender_id);
        updateStatus(sender_id,"Offline");
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("Error: " + throwable.getMessage());
    }
    public static void sendMessageToPvt(String receiver_id, String sender_id, JSONObject jsonResponse) throws IOException {
        Session receiverSession = userSessions.get(receiver_id);
        Session senderSession = userSessions.get(sender_id);
        if (receiverSession != null && receiverSession.isOpen()) {

            receiverSession.getBasicRemote().sendText(jsonResponse.toString());
        }
        if(senderSession !=null && senderSession.isOpen()){
            senderSession.getBasicRemote().sendText(jsonResponse.toString());
        }
    }
    public static void sendFilesTogrp(String grp_id, JSONObject jsonResponse) throws IOException {
        try{
            ResultSet rs=fetchGrpMembers(grp_id);
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

    public static void  sendMessageToGroup(String grp_id,String msg_id,String message,String msg_iv,Map<String,String> memberaesKeyMap, String sender_id,String sender_name,String old_senderid,String old_msgid,boolean isforward) throws IOException {

        System.out.println(memberaesKeyMap.size());

        for (Map.Entry<String, String> entry : memberaesKeyMap.entrySet()) {
            String member_id = entry.getKey();
            String key = entry.getValue();
            Session receiverSession = userSessions.get(member_id);
            if(receiverSession != null && receiverSession.isOpen() && !member_id.equals(sender_id)) {
                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("dataFormat", "Text");
                jsonResponse.put("grp_id", grp_id);
                jsonResponse.put("mess_id", msg_id);
                jsonResponse.put("member_id", member_id);
                jsonResponse.put("sender_id",sender_id);
                jsonResponse.put("message",message);
                jsonResponse.put("iv",msg_iv);
                jsonResponse.put("aes_key_receiver",key);
                jsonResponse.put("sender_name",sender_name);
                jsonResponse.put("old_senderid",old_senderid);
                jsonResponse.put("old_msgid",old_msgid);
                jsonResponse.put("isforward",isforward);

                receiverSession.getBasicRemote().sendText(jsonResponse.toString());

            }
        }


    }





}


