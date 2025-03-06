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

@WebServlet("/UpdateSeen")
public class UpdateSeenStatusServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String  user_id = jsonObject.get("user_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            if(con != null) {
                String qry ="update mentions set seen =true where group_id=? and user_id=?";
                try{
                    ps = con.prepareStatement(qry);
                    ps.setString(1, grp_id);
                    ps.setString(2, user_id);
                    ps.executeUpdate();
                    jsonResponse.put("message","update seen successful");
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("message","update seen successful");
            }

        }
        else{
            jsonResponse.put("message","unauthorized request");
        }
        response.getWriter().write(jsonResponse.toString());
    }
}
