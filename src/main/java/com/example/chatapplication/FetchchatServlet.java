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
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/FetchchatServlet")
public class FetchchatServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id!=null ){

            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String receiver_id = jsonObject.get("userid").getAsString();
            String msgType = jsonObject.get("type").getAsString();

            Connection con = DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            ResultSet rss;
            List<JSONObject> msgList;

            if(con != null){

                    String qry = "select * from messages where ((send_id = ? and receiver_id =?) or (send_id = ? and receiver_id =?)) order by created_at asc; ";
                    String qrys="select * from files where ((sender_id = ? and receiver_id =?) or (sender_id = ? and receiver_id =?)) order by created_at asc; ";
                    String qryFrokey = "select * from users where user_id=?";
                    String qryForgrpMsg ="SELECT gm.grpmssg_id, gm.grp_id, gm.sender_id, gm.message, gm.created_at, gm.msg_iv, u.name, ge.enc_aes_key FROM group_messages gm JOIN users u ON gm.sender_id = u.user_id JOIN aes_keys ge ON gm.grpmssg_id = ge.grpmssg_id WHERE gm.grp_id = ? AND gm.created_at >= (SELECT gg.added_at FROM group_members gg WHERE gg.user_id = ? AND gg.grp_id =?) AND ge.receiver_id = ? order by gm.created_at asc ";
                    String qryGrps="select f.*, u.name from files f join users u ON f.sender_id = u.user_id or f.receiver_id = u.user_id   where f.receiver_id = ? and f.created_at >= (select added_at from group_members where grp_id = ? and user_id = ?)";
                    String adminqry ="select * from group_members where user_id=? and grp_id=?";
                    try {
                        if(msgType.equals("Private")) {
                            ps = con.prepareStatement(qry);
                            ps.setString(1, sender_id);
                            ps.setString(2, receiver_id);
                            ps.setString(3, receiver_id);
                            ps.setString(4, sender_id);
                            rs = ps.executeQuery();
                            ps=con.prepareStatement(qrys);
                            ps.setString(1, sender_id);
                            ps.setString(2, receiver_id);
                            ps.setString(3, receiver_id);
                            ps.setString(4, sender_id);
                            rss = ps.executeQuery();
                            msgList=MsgPackForPrivate(rs,rss);

                        }
                        else{
                            System.out.println(receiver_id+"^^"+sender_id);
                            ps = con.prepareStatement(qryForgrpMsg);
                            ps.setString(1, receiver_id);
                            ps.setString(2, sender_id);
                            ps.setString(3, receiver_id);
                            ps.setString(4, sender_id);
                            rs = ps.executeQuery();

                            ps = con.prepareStatement(qryGrps);
                            ps.setString(1,receiver_id);
                            ps.setString(2, receiver_id);
                            ps.setString(3, sender_id);
                            rss = ps.executeQuery();

                            msgList=msgPackForGroup(rs,rss);
                            ps =con.prepareStatement(adminqry);
                            ps.setString(1, sender_id);
                            ps.setString(2, receiver_id);
                            rs = ps.executeQuery();

                            if(rs.next()) {
                                jsonResponse.put("isAdmin", rs.getBoolean("isAdmin"));
                            }


                        }
                        ps = con.prepareStatement(qryFrokey);
                        ps.setString(1, receiver_id);
                        rs = ps.executeQuery();

                        if (rs.next()) {
                            jsonResponse.put("key", rs.getString("rsa_public_key"));
                        }
                        jsonResponse.put("messages", new JSONArray(msgList));
                        System.out.println(jsonResponse.toString());
                        response.getWriter().write(jsonResponse.toString());

                    } catch (SQLException e) {
                        e.printStackTrace();
                        response.getWriter().write("{\"status\":\"error\", \"message\":\"Something went wrong\"}");

                    }


            }

        }
        else{
            response.getWriter().write("Unauthorized: No token found");
        }


    }

    private List<JSONObject> MsgPackForPrivate(ResultSet rs, ResultSet rss) throws SQLException {
        List<JSONObject> msgList = new ArrayList<>();
        boolean textMsg = rs.next();
        boolean stickerMsg = rss.next();
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
        while(stickerMsg){
            JSONObject msg = new JSONObject();
            msg.put("dataFormat","Sticker");
            msg.put("mess_id", rss.getString("file_id"));
            msg.put("sender_id", rss.getString("sender_id"));
            msg.put("receiver_id", rss.getString("receiver_id"));
            msg.put("file_name", rss.getString("file_name"));
            msg.put("timestamp", rss.getString("created_at"));
            msgList.add(msg);
            stickerMsg=rss.next();

        }
        return msgList;


    }
    private List<JSONObject> msgPackForGroup(ResultSet rs, ResultSet rss) throws SQLException{
        List<JSONObject> msgList = new ArrayList<>();
        boolean textMsg = rs.next();
        boolean stickerMsg = rss.next();
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

        while(stickerMsg){
            JSONObject msg = new JSONObject();
            msg.put("dataFormat","Sticker");
            msg.put("mess_id", rss.getString("file_id"));
            msg.put("sender_id", rss.getString("sender_id"));
            msg.put("receiver_id", rss.getString("receiver_id"));
            msg.put("file_name", rss.getString("file_name"));
            msg.put("timestamp", rss.getString("created_at"));
         //   msg.put("sender_name", rs.getString("name"));
            msgList.add(msg);
            stickerMsg=rss.next();
        }


        return msgList;

    }

}
