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

@WebServlet("/CreateRole")
public class CreateRoleServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if (sender_id != null) {
            JsonObject role = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String role_name = role.get("role_name").getAsString();
            String role_description = role.get("role_des").getAsString();
            String grp_id = role.get("grp_id").getAsString();
            if(!AdminVerification.adminVerfiy(sender_id,grp_id)){
                jsonResponse.put("message","unauthorized access");
                response.getWriter().write(jsonResponse.toString());
                return;
            }
            JsonArray permissions = role.getAsJsonArray("permissions");
            JsonArray memebers = role.getAsJsonArray("members");
            Connection con =DBconnection.getConnection();
            if(con != null) {
                String role_id=createRole(role_name,grp_id,role_description,con);
                mapPermission(role_id,permissions,con);
                mapMembers(role_id,grp_id,memebers,con);
                jsonResponse.put("message","role created successfully");
            }
            else{
                jsonResponse.put("status", "DB error");
            }




        }
        else{
            jsonResponse.put("status", "unauthorized");
        }
        response.getWriter().write(jsonResponse.toString());
    }
    private String createRole(String role_name, String grp_id,String role_description,Connection con) {
        PreparedStatement ps;
        String qry="insert into roles (role_id,group_id,role_name,role_description) values (?,?,?,?)";
        String role_id=IdGeneration.generateRandomID();
        try{
            ps=con.prepareStatement(qry);
            ps.setString(1,role_id);
            ps.setString(2,grp_id);
            ps.setString(3,role_name);
            ps.setString(4,role_description);
            ps.executeUpdate();
            return role_id;
        }catch (SQLException e){
            e.printStackTrace();
        }
        return null;

    }
    private void mapPermission(String role_id,JsonArray permissions,Connection con) {
        PreparedStatement ps;
        String qry="insert into role_permissions (id,role_id,permission_id) values (?,?,?)";
        try{
            ps=con.prepareStatement(qry);
            for (JsonElement element : permissions) {
                ps.setString(1,IdGeneration.generateRandomID());
                ps.setString(2,role_id);
                ps.setString(3,element.getAsString());
                ps.executeUpdate();
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
    }
    private void mapMembers(String role_id,String grp_id,JsonArray members ,Connection con) {
        PreparedStatement ps;
        String qry="insert into member_roles (id,member_id,group_id,role_id) values (?,?,?,?)";
        try{
            ps=con.prepareStatement(qry);
            for (JsonElement element : members) {
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
