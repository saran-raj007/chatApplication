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
            String dataFormat = jsonObject.get("dataFormat").getAsString();
            Connection con = DBconnection.getConnection();
            PreparedStatement ps;
            if(con != null){

                String qry = (dataFormat.equals("Text"))? (isGroup) ? "delete from group_messages where grpmss_id=?" :"delete from messages where mess_id=?" : "delete from files where file_id=?";

                try{
                    ps = con.prepareStatement(qry);
                    ps.setString(1, msg_id);
                    int row = ps.executeUpdate();
                    if(row > 0){
                        System.out.println("Delete Message Success");
                    }
                    else{
                        System.out.println("Delete Message Failed");

                    }
                    jsonResponse.put("message","success");
                    response.getWriter().write(jsonResponse.toString());

                } catch (SQLException e) {
                    e.printStackTrace();
                    jsonResponse.put("message","error");
                    response.getWriter().write(jsonResponse.toString());
                }





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
}
