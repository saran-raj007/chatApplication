package com.example.chatapplication;

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
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/FetchGroupMembers")
public class FetchGroupMembersServlet extends HttpServlet {

    public  void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        if(sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;
            List<JSONObject> grpMembers = new ArrayList<>();
            if(con != null){
                String qryForGrpMem ="select u.user_id,u.name,u.mobile_number,u.rsa_public_key,gm.isAdmin from users u join group_members gm on gm.user_id=u.user_id where gm.grp_id =?";
                String role ="select r.role_name from roles r join member_roles mr on mr.role_id = r.role_id where mr.group_id =? and mr.member_id =?";
                try{
                    ps = con.prepareStatement(qryForGrpMem);
                    ps.setString(1,grp_id);
                    rs = ps.executeQuery();

                    while(rs.next()){
                        JSONObject grpMember = new JSONObject();
                        grpMember.put("user_id", rs.getString("user_id"));
                        grpMember.put("name", rs.getString("name"));
                        grpMember.put("mobile_number", rs.getString("mobile_number"));
                        grpMember.put("isAdmin", rs.getBoolean("isAdmin"));
                        grpMember.put("rsa_public_key",rs.getString("rsa_public_key"));
                        ps=con.prepareStatement(role);
                        ps.setString(1,grp_id);
                        ps.setString(2,rs.getString("user_id"));
                        ResultSet rs2 = ps.executeQuery();
                        ArrayList<String> roleNames = new ArrayList<>();
                        while(rs2.next()){
                            roleNames.add(rs2.getString("role_name"));

                        }
                        grpMember.put("role_names",roleNames);
                        grpMembers.add(grpMember);
                    }
                    JSONObject jsonResponse = new JSONObject();
                    jsonResponse.put("grp_members", new JSONArray(grpMembers));
                    response.getWriter().write(jsonResponse.toString());

                }catch (SQLException e){
                    e.printStackTrace();
                    response.getWriter().write(e.toString());

                }

            }


        }
        else{
            response.getWriter().write("{\"error\": \"Invalid token\"}");

        }
    }


}
