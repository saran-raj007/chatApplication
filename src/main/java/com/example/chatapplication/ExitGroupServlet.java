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

@WebServlet("/ExitGroupServlet")
public class ExitGroupServlet extends HttpServlet {
    public  void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){

            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String member_id = jsonObject.get("member_id").getAsString();
            Connection con = DBconnection.getConnection();
            PreparedStatement ps =null;
            if(con != null){
                String  qry ="delete from group_members where grp_id =? and user_id =?";
                String qryfordelRole ="delete from member_roles where member_id =?";

                try{
                    ps = con.prepareStatement(qry);
                    ps.setString(1,grp_id);
                    ps.setString(2,member_id);
                    int rowUpdate =ps.executeUpdate();
                    ps=con.prepareStatement(qryfordelRole);
                    ps.setString(1,member_id);
                    ps.executeUpdate();
                    if(rowUpdate == 1){
                       // System.out.println("Member Successfully Exited form the group");
                        jsonResponse.put("Message", "Member Successfully Exited form the group");

                        response.getWriter().write(jsonResponse.toString());


                    }
                    else {
                        jsonResponse.put("Message","Member UnSuccessfully Exited form the group");
                        response.getWriter().write(jsonResponse.toString());


                    }

                }catch (SQLException e){
                    e.printStackTrace();
                    jsonResponse.put("Message", "Database Error");
                    response.getWriter().write(jsonResponse.toString());

                }

            }
            else{
                jsonResponse.put("Message", "Database Error");
                response.getWriter().write(jsonResponse.toString());
            }


        }
        else{
            jsonResponse.put("Message", "Database Error");
            response.getWriter().write(jsonResponse.toString());
        }

    }

}
