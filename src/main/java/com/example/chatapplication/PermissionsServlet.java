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

@WebServlet("/getPermissions")
public class PermissionsServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if (sender_id!= null) {
            Connection con = DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            if(con != null) {
                try {
                    rs=getPermissions(con);
                    while(rs.next()) {
                        jsonResponse.put(rs.getString("permission_id"),rs.getString("permission_name"));
                    }
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }

            }
        }
        else{
            jsonResponse.put("status","unauthorized");
        }
        response.getWriter().write(jsonResponse.toString());
    }

    public static  ResultSet getPermissions(Connection con) throws SQLException {
        PreparedStatement ps;
        try{
            String qry="select * from permissions";
            ps= con.prepareStatement(qry);
            ps= con.prepareStatement(qry);
            return ps.executeQuery();


        }catch (SQLException e){
            e.printStackTrace();
        }
        return null;

    }
}
