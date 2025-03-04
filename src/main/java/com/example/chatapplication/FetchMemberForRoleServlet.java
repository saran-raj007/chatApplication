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

@WebServlet("/FetchMembers")
public class FetchMemberForRoleServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String role_id = jsonObject.get("role_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            if(con!=null){
                String query = "SELECT u.user_id, u.name, u.mobile_number FROM users u JOIN group_members gm ON u.user_id = gm.user_id LEFT JOIN member_roles mr ON gm.user_id = mr.member_id AND mr.role_id = ? WHERE gm.grp_id = ? AND mr.member_id IS NULL";
                try{
                    ps = con.prepareStatement(query);
                    ps.setString(1, role_id);
                    ps.setString(2, grp_id);
                    rs = ps.executeQuery();
                    List<JSONObject> grpMembers = new ArrayList<>();
                    while(rs.next()){
                        JSONObject grpMember = new JSONObject();
                        grpMember.put("user_id", rs.getString("user_id"));
                        grpMember.put("name", rs.getString("name"));
                        grpMember.put("mobile_number", rs.getString("mobile_number"));
                        grpMembers.add(grpMember);

                    }
                    jsonResponse.put("grp_members", new JSONArray(grpMembers));

                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("error", "Error on DB");

            }


        }
        else{
            jsonResponse.put("error", "Unauthorized");

        }
        response.getWriter().write(jsonResponse.toString());
    }
}
