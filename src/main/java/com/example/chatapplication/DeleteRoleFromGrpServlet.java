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
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/DeleteRoleFromGrp")
public class DeleteRoleFromGrpServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id= UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id!=null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String role_id = jsonObject.get("role_id").getAsString();
            if(!AdminVerification.adminVerfiy(sender_id,grp_id)){
                jsonResponse.put("message","unauthorized access");
                response.getWriter().write(jsonResponse.toString());
                return;
            }
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            if(con!=null){
                String qry = "delete from roles where role_id=? and group_id=?";
                try{
                    ps = con.prepareStatement(qry);
                    ps.setString(1,role_id);
                    ps.setString(2,grp_id);
                    ps.executeUpdate();
                    jsonResponse.put("message","role deleted successfully");

                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("message","Error on DB");
            }

        }
        else{
            jsonResponse.put("message","Unauthorized access");
        }
        response.getWriter().write(jsonResponse.toString());
    }
}
