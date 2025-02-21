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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/CreateForkMessage")
public class CreateForkMessageServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String stoken = cookieExtract(request);
        String sender_id = UserSessionGenerate.validateToken(stoken,request);
        JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
        boolean isGroup = jsonObject.get("isGroup").getAsBoolean();
        String forkId = jsonObject.get("fork_id").getAsString();
        String receiver_id_file = jsonObject.get("receiver_id_file").getAsString();
        String msg_time = jsonObject.get("msg_time").getAsString();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Timestamp parsedDate = null;
        int incrementSeconds =1;
        try {
            Date utilDate = dateFormat.parse(msg_time);
            parsedDate = new java.sql.Timestamp(utilDate.getTime());
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        JsonArray jsonArray = jsonObject.getAsJsonArray("messages");
        ResultSet rs = getFiles(isGroup,sender_id,receiver_id_file,parsedDate);
        try{
            if(!isGroup){
                boolean fileData = false;
                fileData =rs.next();
                Iterator<JsonElement> iterator = jsonArray.iterator();
                boolean msg_data = iterator.hasNext();
                System.out.println(fileData+" "+msg_data);
                while (msg_data && fileData) {
                    JsonElement jsonElement = iterator.next();
                    JsonObject jsonObjectt = jsonElement.getAsJsonObject();
                    String created_at = jsonObjectt.get("created_at").getAsString();
                    Timestamp parsedDate_msg = null;
                    try {
                        Date utilDate = dateFormat.parse(created_at);
                        parsedDate_msg = new java.sql.Timestamp(utilDate.getTime());
                    } catch (ParseException e) {
                        throw new RuntimeException(e);
                    }
                    Timestamp timestamp = rs.getTimestamp("created_at");
                    System.out.println(parsedDate_msg+" & "+ timestamp);
                    if(parsedDate_msg.compareTo(timestamp)<0){

                        String messId = jsonObjectt.get("mess_id").getAsString();
                        String senderId = jsonObjectt.get("sender_id").getAsString();
                        String receiverId = jsonObjectt.get("receiver_id").getAsString();
                        String message = jsonObjectt.get("message").getAsString();
                        String iv = jsonObjectt.get("iv").getAsString();
                        JsonArray keysArray = jsonObjectt.getAsJsonArray("enc_aes_keys");
                        Map<String, String> keysMap = new HashMap<>();
                        for (JsonElement keyElement : keysArray) {
                            JsonObject keyObject = keyElement.getAsJsonObject();
                            for (Map.Entry<String, JsonElement> entry : keyObject.entrySet()) {
                                keysMap.put(entry.getKey(), entry.getValue().getAsString());
                            }
                        }
                        insetKeys(forkId,senderId,receiverId,message,iv,parsedDate,keysMap,incrementSeconds);
                        msg_data=iterator.hasNext();

                    }
                    else{
                        String file_id = rs.getString("file_id");
                        String sender_id_file = rs.getString("sender_id");
                        String receiver_id = rs.getString("receiver_id");
                        String file_name = rs.getString("file_name");
                        insertFiles(sender_id_file,forkId,file_name,incrementSeconds);
                        fileData=rs.next();
                    }
                    incrementSeconds++;


                }
                while(msg_data){
                    JsonElement jsonElement = iterator.next();
                    JsonObject jsonObjectt = jsonElement.getAsJsonObject();
                    String created_at = jsonObjectt.get("created_at").getAsString();
                    ///Timestamp timestamp = rs.getTimestamp("created_at");
                    //String messId = jsonObjectt.get("mess_id").getAsString();
                    String senderId = jsonObjectt.get("sender_id").getAsString();
                    String receiverId = jsonObjectt.get("receiver_id").getAsString();
                    String message = jsonObjectt.get("message").getAsString();
                    String iv = jsonObjectt.get("iv").getAsString();
                    JsonArray keysArray = jsonObjectt.getAsJsonArray("enc_aes_keys");
                    Map<String, String> keysMap = new HashMap<>();
                    for (JsonElement keyElement : keysArray) {
                        JsonObject keyObject = keyElement.getAsJsonObject();
                        for (Map.Entry<String, JsonElement> entry : keyObject.entrySet()) {
                            keysMap.put(entry.getKey(), entry.getValue().getAsString());
                        }
                    }
                    insetKeys(forkId,senderId,receiverId,message,iv,parsedDate,keysMap,incrementSeconds);
                    msg_data=iterator.hasNext();
                    incrementSeconds++;

                }
                while(fileData){
                    String file_id = rs.getString("file_id");
                    String sender_id_file = rs.getString("sender_id");
                    String receiver_id = rs.getString("receiver_id");
                    String file_name = rs.getString("file_name");
                    insertFiles(sender_id_file,forkId,file_name,incrementSeconds);
                    fileData=rs.next();
                    incrementSeconds++;

                }


            }
            else{
                boolean fileData = rs.next();
                Iterator<JsonElement> iterator = jsonArray.iterator();
                boolean msg_data = iterator.hasNext();
                while (msg_data && fileData) {
                    JsonElement jsonElement = iterator.next();
                    JsonObject jsonObjectt = jsonElement.getAsJsonObject();
                    String created_at = jsonObjectt.get("created_at").getAsString();
                    Timestamp parsedDate_msg = null;
                    try {
                        Date utilDate = dateFormat.parse(created_at);
                        parsedDate_msg = new java.sql.Timestamp(utilDate.getTime());
                    } catch (ParseException e) {
                        throw new RuntimeException(e);
                    }
                    Timestamp timestamp = rs.getTimestamp("created_at");
                    if(parsedDate_msg.compareTo(timestamp)<0){
                        String messId = jsonObjectt.get("mess_id").getAsString();
                        String senderId = jsonObjectt.get("sender_id").getAsString();
                        String receiverId = jsonObjectt.get("receiver_id").getAsString();
                        String message = jsonObjectt.get("message").getAsString();
                        String iv = jsonObjectt.get("iv").getAsString();
                        JsonArray keysArray = jsonObjectt.getAsJsonArray("enc_aes_keys");
                        Map<String, String> keysMap = new HashMap<>();
                        ResultSet rss= getOldMembersKeyGrp(messId);
                        while (rss.next()) {
                            keysMap.put(rs.getString("receiver_id"), rs.getString("enc_aes_key"));
                        }
                        for (JsonElement keyElement : keysArray) {
                            JsonObject keyObject = keyElement.getAsJsonObject();
                            for (Map.Entry<String, JsonElement> entry : keyObject.entrySet()) {
                                keysMap.put(entry.getKey(), entry.getValue().getAsString());
                            }
                        }
                        insetKeys(forkId,senderId,receiverId,message,iv,parsedDate,keysMap,incrementSeconds);
                        msg_data=iterator.hasNext();

                    }
                    else{
                        String file_id = rs.getString("file_id");
                        String sender_id_file = rs.getString("sender_id");
                        String receiver_id = rs.getString("receiver_id");
                        String file_name = rs.getString("file_name");
                        insertFiles(sender_id_file,forkId,file_name,incrementSeconds);
                        fileData=rs.next();
                    }
                    incrementSeconds++;


                }
                while(msg_data){
                    JsonElement jsonElement = iterator.next();
                    JsonObject jsonObjectt = jsonElement.getAsJsonObject();
                    String created_at = jsonObjectt.get("created_at").getAsString();
                    String messId = jsonObjectt.get("mess_id").getAsString();
                    String senderId = jsonObjectt.get("sender_id").getAsString();
                    String receiverId = jsonObjectt.get("receiver_id").getAsString();
                    String message = jsonObjectt.get("message").getAsString();
                    String iv = jsonObjectt.get("iv").getAsString();
                    JsonArray keysArray = jsonObjectt.getAsJsonArray("enc_aes_keys");
                    Map<String, String> keysMap = new HashMap<>();
                    ResultSet rss= getOldMembersKeyGrp(messId);
                    while (rss.next()) {
                        keysMap.put(rs.getString("receiver_id"), rs.getString("enc_aes_key"));
                    }
                    for (JsonElement keyElement : keysArray) {
                        JsonObject keyObject = keyElement.getAsJsonObject();
                        for (Map.Entry<String, JsonElement> entry : keyObject.entrySet()) {
                            keysMap.put(entry.getKey(), entry.getValue().getAsString());
                        }
                    }
                    insetKeys(forkId,senderId,receiverId,message,iv,parsedDate,keysMap,incrementSeconds);
                    msg_data=iterator.hasNext();
                    incrementSeconds++;

                }
                while(fileData){
                    String file_id = rs.getString("file_id");
                    String sender_id_file = rs.getString("sender_id");
                    String receiver_id = rs.getString("receiver_id");
                    String file_name = rs.getString("file_name");
                    insertFiles(sender_id_file,forkId,file_name,incrementSeconds);
                    fileData=rs.next();
                    incrementSeconds++;

                }


            }


        }catch (SQLException e){
            e.printStackTrace();

        }

    }
//    private ResultSet getOldMembersKeyPvt(String messId){
//        Connection con = DBconnection.getConnection();
//        PreparedStatement ps;
//        ResultSet rs;
//
//        if(con != null){
//            String qry = "select * from messages where mess_id=?";
//            try{
//                ps = con.prepareStatement(qry);
//                ps.setString(1, messId);
//                rs = ps.executeQuery();
//                return rs;
//
//            }catch (SQLException e){
//                e.printStackTrace();
//            }
//        }
//        return null;
//
//    }
    private ResultSet getOldMembersKeyGrp(String messId){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        ResultSet rs;
        if(con != null){
            String qry = "select * from aes_keys where grpmssg_id=?";
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1, messId);
                rs = ps.executeQuery();
                return rs;

            }catch (SQLException e){
                e.printStackTrace();
            }
        }
        return null;

    }
    private ResultSet getFiles(boolean isGroup,String sender_id,String receiver_id_file,Timestamp created_at){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        ResultSet rs;
        if(con != null){
            String qryPvtfile= "select * from files where ((sender_id = ? and receiver_id =?) or (sender_id = ? and receiver_id =?)) and created_at>=? order by created_at asc;";
            String qryGrps="select * from files  where receiver_id = ? and created_at >=? order by created_at asc ";
            try{
                if(isGroup){
                    ps = con.prepareStatement(qryGrps);
                    ps.setString(1, receiver_id_file);
                    ps.setTimestamp(2, created_at);
                    rs = ps.executeQuery();

                }
                else{
                    ps = con.prepareStatement(qryPvtfile);
                    ps.setString(1, sender_id);
                    ps.setString(2, receiver_id_file);
                    ps.setString(3, receiver_id_file);
                    ps.setString(4,sender_id);
                    ps.setTimestamp(5, created_at);
                    rs = ps.executeQuery();
                }
                return rs;
            }catch (SQLException e){
                e.printStackTrace();

            }
        }
        return null;
    }
    private void insetKeys(String fork_id, String sender_id, String receiver_id, String message, String iv, Date parsedDate, Map<String, String> keysMap,int incrementSeconds ){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        if(con != null){
            String qry ="insert into group_messages (grpmssg_id,grp_id,sender_id,message,msg_iv,created_at) values (?,?,?,?,?,?);";
            String qryKey ="insert into aes_keys (key_id,grpmssg_id,grp_id,receiver_id,enc_aes_key) values (?,?,?,?,?);";
            Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
            Timestamp newTimestamp = incrementTimestamp(currentTimestamp, incrementSeconds);


            try{
                ps = con.prepareStatement(qry);
                String messId = IdGeneration.generateRandomID();
                ps.setString(1, messId);
                ps.setString(2, fork_id);
                ps.setString(3, sender_id);
                ps.setString(4, message);
                ps.setString(5, iv);
                ps.setTimestamp(6,newTimestamp);
                int rows = ps.executeUpdate();
                if(rows>0){
                    System.out.println("success");

                }
                else{
                    System.out.println("error");

                }
                ps = con.prepareStatement(qryKey);
                for(Map.Entry<String, String> entry : keysMap.entrySet()){
                    ps.setString(1, IdGeneration.generateRandomID());
                    ps.setString(2, messId);
                    ps.setString(3, fork_id);
                    ps.setString(4, entry.getKey());
                    ps.setString(5, entry.getValue());
                    rows = ps.executeUpdate();
                    if(rows>0){
                        System.out.println("success");

                    }
                    else{
                        System.out.println("error");

                    }

                }



            }catch (SQLException e){
                e.printStackTrace();

            }
        }

    }
    private void insertFiles(String sender_id, String fork_id, String file_name,int incrementSeconds ){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        if(con != null){
            String qry ="insert into files (file_id,sender_id,receiver_id,file_name,created_at) values (?,?,?,?,?)";
            Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
            Timestamp newTimestamp = incrementTimestamp(currentTimestamp, incrementSeconds);
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1, IdGeneration.generateRandomID());
                ps.setString(2, sender_id);
                ps.setString(3, fork_id);
                ps.setString(4, file_name);
                ps.setTimestamp(5, newTimestamp);
                int rows = ps.executeUpdate();
                if(rows>0){
                    System.out.println("success");
                }
                else{
                    System.out.println("error");
                }

            }catch (SQLException e){
                e.printStackTrace();

            }
        }
    }
    private String cookieExtract(HttpServletRequest request){
        Cookie[] cookies = request.getCookies();

        if (cookies != null){
            for (Cookie cookie : cookies){
                if("SessID".equals(cookie.getName())){
                    return  cookie.getValue();

                }
            }
        }
        return null;

    }
    public static Timestamp incrementTimestamp(Timestamp timestamp, int seconds) {
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(timestamp.getTime());
        cal.add(Calendar.SECOND, seconds);
        return new Timestamp(cal.getTimeInMillis());
    }

}
