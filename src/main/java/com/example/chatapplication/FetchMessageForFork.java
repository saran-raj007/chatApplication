package com.example.chatapplication;

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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/FetchMessageFork")
public class FetchMessageForFork extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String msg_id = jsonObject.get("msg_id").getAsString();
            String timeString = jsonObject.get("msg_time").getAsString();
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date parsedDate = null;
            try {
                parsedDate = dateFormat.parse(timeString);
            } catch (ParseException e) {
                throw new RuntimeException(e);
            }
            Timestamp timestamp = new Timestamp(parsedDate.getTime());
            String senderID =jsonObject.get("sender_id").getAsString();
            String receiver_id = jsonObject.get("receiver_id").getAsString();
            boolean isGroup = jsonObject.get("isGroup").getAsBoolean();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            ResultSet rss;
            List<JSONObject> msgList = null;
            if(con != null){
                String queryPvtmsg = "select * from messages where ((send_id = ? and receiver_id =?) or (send_id = ? and receiver_id =?)) and created_at>=? order by created_at asc;";
                String qryPvtfile= "select * from files where ((sender_id = ? and receiver_id =?) or (sender_id = ? and receiver_id =?)) and created_at>=? order by created_at asc;";
                String qryForgrpMsg ="SELECT gm.grpmssg_id, gm.grp_id, gm.sender_id, gm.message, gm.created_at, gm.msg_iv, u.name, ge.enc_aes_key FROM group_messages gm JOIN users u ON gm.sender_id = u.user_id JOIN aes_keys ge ON gm.grpmssg_id = ge.grpmssg_id WHERE gm.grp_id = ? AND gm.created_at >=?  AND ge.receiver_id = ?  order by gm.created_at asc ";
                String qryGrps="select f.*, u.name from files f join users u ON f.sender_id = u.user_id where f.receiver_id = ? and f.created_at >=? order by f.created_at asc ";


                if(!isGroup){
                    System.out.println(senderID+" "+receiver_id+" "+timestamp);
                    try{
                        ps=con.prepareStatement(queryPvtmsg);
                        ps.setString(1, sender_id);
                        ps.setString(2, receiver_id);
                        ps.setString(3, receiver_id);
                        ps.setString(4, sender_id);
                        ps.setTimestamp(5, timestamp);
                        rs=ps.executeQuery();


                        msgList=MsgPackForPrivate(rs);


                    }catch (SQLException e){
                        e.printStackTrace();
                    }

                }
                else{
                    try{

                        ps = con.prepareStatement(qryForgrpMsg);
                        ps.setString(1, receiver_id);
                        ps.setTimestamp(2, timestamp);
                       // ps.setString(3, receiver_id);
                        ps.setString(3, sender_id);
                        rs = ps.executeQuery();

                        ps = con.prepareStatement(qryGrps);
                        ps.setString(1,receiver_id);
                        ps.setTimestamp(2, timestamp);
                       // ps.setString(3, sender_id);
                        rss = ps.executeQuery();
                        msgList=msgPackForGroup(rs);

                    }catch (SQLException e){
                        e.printStackTrace();
                    }

                }
                jsonResponse.put("messages", new JSONArray(msgList));
                System.out.println(jsonResponse.toString());
                response.getWriter().write(jsonResponse.toString());



            }
            else{
                jsonResponse.put("error","DB connection error");
                response.getWriter().write(jsonResponse.toString());
            }


        }
        else{
            jsonResponse.put("error","unauthorized");
            response.getWriter().write(jsonResponse.toString());
        }
    }

    private List<JSONObject> MsgPackForPrivate(ResultSet rs) throws SQLException {
        List<JSONObject> msgList = new ArrayList<>();
        boolean textMsg = rs.next();
        while(textMsg) {
            JSONObject msg = new JSONObject();
            msg.put("dataFormat","Text");
            msg.put("mess_id", rs.getString("mess_id"));
            msg.put("sender_id", rs.getString("send_id"));
            msg.put("receiver_id", rs.getString("receiver_id"));
            msg.put("message", rs.getString("message"));
            msg.put("iv", rs.getString("iv"));
            msg.put("aes_key_receiver", rs.getString("aes_key_receiver"));
            msg.put("aes_key_sender", rs.getString("aes_key_sender"));
            msg.put("timestamp", rs.getString("created_at"));
            msgList.add(msg);
            textMsg=rs.next();
        }

        return msgList;


    }
    private List<JSONObject> msgPackForGroup(ResultSet rs) throws SQLException{
        List<JSONObject> msgList = new ArrayList<>();
        boolean textMsg = rs.next();

        while (textMsg) {
            JSONObject msg = new JSONObject();
            msg.put("dataFormat","Text");
            msg.put("mess_id", rs.getString("grpmssg_id"));
            msg.put("grp_id", rs.getString("grp_id"));
            msg.put("sender_id", rs.getString("sender_id")); // consider this line
            msg.put("message", rs.getString("message"));
            msg.put("iv", rs.getString("msg_iv"));
            msg.put("enc_aes_key", rs.getString("enc_aes_key"));
            msg.put("sender_name", rs.getString("name"));
            msg.put("timestamp", rs.getString("created_at"));
            msgList.add(msg);
            textMsg=rs.next();

        }


        return msgList;

    }
}

