package com.example.chatapplication;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import jakarta.servlet.*;
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

@WebServlet("/AddMemberToRole")
public class AddMemberToRoleServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String role_id = jsonObject.get("role_id").getAsString();
            if(!AdminVerification.adminVerfiy(sender_id,grp_id)){
                jsonResponse.put("message","unauthorized access");
                response.getWriter().write(jsonResponse.toString());
                return;
            }
            JsonArray memebers = jsonObject.getAsJsonArray("members");
            Connection con =DBconnection.getConnection();
            if(con != null) {
                addMember(grp_id,role_id,memebers,con);
                jsonResponse.put("success","member_added");

            }
            else{
                jsonResponse.put("status", "Error on DB");

            }


        }
        else{
            jsonResponse.put("status", "unauthorized");
        }
        response.getWriter().write(jsonResponse.toString());
    }
    private void addMember(String grp_id, String role_id, JsonArray memebers, Connection con) {
        PreparedStatement ps;
        String qry ="insert into member_roles (id,member_id,group_id,role_id) values (?,?,?,?)";
        try{
            ps = con.prepareStatement(qry);
            for (JsonElement element : memebers) {
                ps.setString(1,IdGeneration.generateRandomID());
                ps.setString(2, element.getAsString());
                ps.setString(3,grp_id);
                ps.setString(4,role_id);
                ps.executeUpdate();
            }

        }catch (SQLException e){
            e.printStackTrace();
        }


    }
}
