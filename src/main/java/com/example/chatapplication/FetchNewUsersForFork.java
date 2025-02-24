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


@WebServlet("/FetchNewUsersForFork")
public class FetchNewUsersForFork extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String user_id = jsonObject.get("grp_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps = null;
            ResultSet rs = null;
            List<JSONObject> users = new ArrayList<>();
            if(con != null){
                String qryForuser ="select * from users where user_id !=? and user_id != ?";
                try{
                    ps = con.prepareStatement(qryForuser);
                    ps.setString(1,sender_id);
                    ps.setString(2,user_id);
                    rs = ps.executeQuery();

                    while(rs.next()){
                        JSONObject user = new JSONObject();
                        user.put("user_id", rs.getString("user_id"));
                        user.put("name", rs.getString("name"));
                        user.put("mobile_number", rs.getString("mobile_number"));
                        users.add(user);
                    }
                    jsonResponse.put("users", new JSONArray(users));
                    response.getWriter().write(jsonResponse.toString());

                }catch (SQLException e){
                    e.printStackTrace();
                    jsonResponse.put("error", "SQL Error");
                    response.getWriter().write(jsonResponse.toString());

                }

            }


        }
        else{
            jsonResponse.put("error", "Invalid token");
            response.getWriter().write(jsonResponse.toString());
        }
    }
}
