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

import jakarta.websocket.Session;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/RemoveMemberFromRole")
public class RemoveFromRoleServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id!=null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String member_id = jsonObject.get("member_id").getAsString();
            String role_id = jsonObject.get("role_id").getAsString();
            String grp_id = jsonObject.get("grp_id").getAsString();
            Connection con = DBconnection.getConnection();
            if(con!=null){
                removeFromRole(member_id,role_id,grp_id,con);
                jsonResponse.put("message","Member Remove success");
            }
            else{
                jsonResponse.put("error","Error on DB connection");

            }


        }
        else{
            jsonResponse.put("error","Unauthorized");
        }
        response.getWriter().write(jsonResponse.toString());
    }
    private void removeFromRole(String member_id,String role_id,String grp_id,Connection con) {
        PreparedStatement ps;
        String qry ="delete from member_roles where role_id=? and group_id=? and member_id=?";
        try{
            ps = con.prepareStatement(qry);
            ps.setString(1,role_id);
            ps.setString(2,grp_id);
            ps.setString(3,member_id);
            ps.executeUpdate();

        }catch (SQLException e){
            e.printStackTrace();
        }

    }
}
