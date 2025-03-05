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

import javax.management.relation.Role;

@WebServlet("/GetRole")
public class GetRoleServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id!=null){
            JsonObject grp_details = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grpId = grp_details.get("grp_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            ArrayList<JSONObject> roles = new ArrayList<JSONObject>();
            if(con!=null){
                String query ="select * from roles where group_id=?";
                try{
                    ps=con.prepareStatement(query);
                    ps.setString(1, grpId);
                    rs=ps.executeQuery();
                    while(rs.next()){
                        JSONObject role = new JSONObject();
                        role.put("role_id",rs.getString("role_id"));
                        role.put("role_name",rs.getString("role_name"));
                        roles.add(role);
                    }
                    jsonResponse.put("roles",roles);

                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("error","Error on DB");
            }

        }
        else{
            jsonResponse.put("error","Unauthorized");

        }
        response.getWriter().write(jsonResponse.toString());
    }
}
