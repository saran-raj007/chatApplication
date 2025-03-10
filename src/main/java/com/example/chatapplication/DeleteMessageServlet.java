package com.example.chatapplication;


import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStreamReader;
import java.sql.*;
import org.json.JSONObject;

@WebServlet("/DeleteMessage")
public class DeleteMessageServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        String usr_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(usr_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            boolean isGroup = jsonObject.get("isGroup").getAsBoolean();
            String msg_id = jsonObject.get("msg_id").getAsString();
            String request_id = jsonObject.get("request_id").getAsString();
            String dataFormat = jsonObject.get("dataFormat").getAsString();
            String option = jsonObject.get("option").getAsString();
            String receiver_id = jsonObject.get("receiver_id").getAsString();
            boolean isequal = jsonObject.get("isequal").getAsBoolean();
            Connection con = DBconnection.getConnection();
            PreparedStatement ps;
            if(con != null){
                if(isGroup){
                    String qry="";
                    if(dataFormat.equals("Text")){
                        if(option.equals("DFM") ){
                            qry ="delete from aes_keys where grpmssg_id=?and receiver_id=?";
                            try {
                                ps= con.prepareStatement(qry);
                                ps.setString(1, msg_id);
                                ps.setString(2, request_id);
                                ps.executeUpdate();
                            } catch (SQLException e) {
                                throw new RuntimeException(e);
                            }
                        }
                        else if(option.equals("DFE")){
                            if(!AdminVerification.OperationVerify(usr_id,receiver_id,"Delete Message")){
                                jsonResponse.put("message","unauthorized access");
                                response.getWriter().write(jsonResponse.toString());
                                return;
                            }
                            qry ="delete from group_messages where grpmssg_id=?";
                            try {
                                ps= con.prepareStatement(qry);
                                ps.setString(1, msg_id);
                                ps.executeUpdate();
                            } catch (SQLException e) {
                                throw new RuntimeException(e);
                            }
                            WebSocketServer.deleteMessage(msg_id,isGroup,request_id,receiver_id);

                        }

                    }
                    else{
                        try {
                            deleteFile(option,msg_id,request_id,con,isGroup,receiver_id);
                        } catch (SQLException e) {
                            throw new RuntimeException(e);
                        }
                    }
                }
                else{
                    String qry = "";
                    if(dataFormat.equals("Text")){
                        if(option.equals("DFM") && isequal){
                            qry ="update messages set aes_key_sender=NULL where mess_id=?";

                        }
                        else if(option.equals("DFM")){
                            qry ="update messages set aes_key_receiver=NULL where mess_id=?";

                        }
                        else if(option.equals("DFE")){

                            qry ="delete from messages where mess_id=?";
                            WebSocketServer.deleteMessage(msg_id,isGroup,request_id,receiver_id);
                        }
                        try{
                            ps = con.prepareStatement(qry);
                            ps.setString(1, msg_id);
                            int row = ps.executeUpdate();
                            if(row > 0){
                                System.out.println("Message deleted successfully");
                            }
                            else{
                                System.out.println("Message could not be deleted");

                            }
                        }catch (SQLException e){
                            e.printStackTrace();

                        }

                    }
                    else{
                        try {
                            deleteFile(option,msg_id,request_id,con,isGroup,receiver_id);
                        } catch (SQLException e) {
                            throw new RuntimeException(e);
                        }
                    }


                }
                jsonResponse.put("message","Message deleted successfully");
                response.getWriter().write(jsonResponse.toString());


            }
            else{
                jsonResponse.put("message","DB error");
                response.getWriter().write(jsonResponse.toString());

            }


        }
        else{
            jsonResponse.put("message","unauthorized");
            response.getWriter().write(jsonResponse.toString());

        }



    }
    private void deleteFile(String option,String msg_id,String request_id,Connection con,boolean isGroup,String receiver_id) throws SQLException, IOException {
        String qry = "";
        PreparedStatement ps = null;
        if(option.equals("DFM")){
            qry ="delete from file_visibility where file_id=? and user_id=? ";
            ps=con.prepareStatement(qry);
            ps.setString(1, msg_id);
            ps.setString(2, request_id);

        }
        else if(option.equals("DFE")){
            qry ="delete from files where file_id=?";
            ps=con.prepareStatement(qry);
            ps.setString(1, msg_id);
            WebSocketServer.deleteMessage(msg_id,isGroup,request_id,receiver_id);
        }
        if (ps != null) {
            ps.executeUpdate();
        }



    }
}
