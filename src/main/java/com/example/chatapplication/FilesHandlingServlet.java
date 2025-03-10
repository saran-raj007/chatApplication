package com.example.chatapplication;

import jakarta.servlet.*;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.util.*;
import org.json.JSONObject;

@MultipartConfig
@WebServlet("/FilesHandling")
public class FilesHandlingServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            Part filePart = request.getPart("sticker");
            String receiver_id = request.getParameter("receiver_id");
            boolean isGroup = request.getParameter("isGroup").equals("true");
            String sender_name = request.getParameter("sender_name");
          //  System.out.println(isGroup+ " "+receiver_id);
            String uniqueFileName = UUID.randomUUID().toString() + ".png";
            String uploadPath = getServletContext().getRealPath("") + File.separator + "uploads";
            //System.out.println(uploadPath);
            Path filePath = Paths.get(uploadPath, uniqueFileName);
            Files.copy(filePart.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            String msg_id=storeFiles(uniqueFileName,sender_id,receiver_id,isGroup,null,null,false);
            jsonResponse.put("mess_id",msg_id);
            jsonResponse.put("dataFormat", "Sticker");
            jsonResponse.put("sender_id", sender_id);
            jsonResponse.put("file_name", uniqueFileName);
            jsonResponse.put("sender_name", sender_name);
            if(isGroup){
                WebSocketServer.sendFilesTogrp(receiver_id,jsonResponse);
            }
            else{
                WebSocketServer.sendMessageToPvt(sender_id,receiver_id,jsonResponse);
            }

            response.getWriter().write(jsonResponse.toString());
        }
        else{
            jsonResponse.put("message", "unauthorized");
            response.getWriter().write(jsonResponse.toString());
        }


    }
    public static  String storeFiles(String file_name,String sender_id,String receiver_id,boolean isGroup,String old_senderid,String oldmsgid,boolean isforward){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con != null) {
            String qryFroFile ="insert into files (file_id,sender_id,receiver_id,file_name,isforward,old_msgid,old_senderid) values (?,?,?,?,?,?,?)";
            try{
                String file_id =IdGeneration.generateRandomID();
                ps = con.prepareStatement(qryFroFile);
                ps.setString(1,file_id);
                ps.setString(2,sender_id);
                ps.setString(3,receiver_id);
                ps.setString(4,file_name);
                ps.setBoolean(5,isforward);
                ps.setString(6,oldmsgid);
                ps.setString(7,old_senderid);

                int rowinsert =ps.executeUpdate();
                if(rowinsert > 0) {
                    System.out.println("File inserted successfully");
                }
                else{
                    System.out.println("File insert failed");
                }
                if(isGroup){
                    String qry ="select * from group_members where grp_id=?";
                    String qry1= "insert into file_visibility (file_id,user_id) values (?,?)";
                    ps = con.prepareStatement(qry);
                    ps.setString(1,receiver_id);
                    ResultSet rs = ps.executeQuery();
                    ps = con.prepareStatement(qry1);
                    while(rs.next()){
                        ps.setString(1,file_id);
                        ps.setString(2,rs.getString("user_id"));
                        int row =ps.executeUpdate();
                        if(row > 0) {
                            System.out.println("File inserted successfully");
                        }
                        else{
                            System.out.println("File insert failed");
                        }

                    }
                }
                else{
                    String qry1= "insert into file_visibility (file_id,user_id) values (?,?)";
                    ps = con.prepareStatement(qry1);
                    ps.setString(1,file_id);
                    ps.setString(2,sender_id);
                    ps.executeUpdate();
                    ps.setString(1,file_id);
                    ps.setString(2,receiver_id);
                    ps.executeUpdate();

                }
                return file_id;

            }catch (SQLException e){
                e.printStackTrace();

            }
        }
        return null;


    }


}
