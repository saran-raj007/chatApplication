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

@WebServlet("/FetchRoles")
public class FetchRolesServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        String sender_id =UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject grp_details = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = grp_details.get("grp_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            JSONArray resultArray = new JSONArray();
            if(con!=null) {
                String qry="SELECT r.role_id, r.role_name, p.permission_id, p.permission_name, u.user_id, u.name, u.mobile_number FROM roles r JOIN role_permissions rp ON r.role_id = rp.role_id JOIN permissions p ON rp.permission_id = p.permission_id LEFT JOIN member_roles mr ON mr.role_id = r.role_id AND mr.group_id = ? LEFT JOIN users u ON mr.member_id = u.user_id GROUP BY r.role_id, r.role_name, p.permission_id, p.permission_name, u.user_id, u.name, u.mobile_number;";
                try{
                    ps=con.prepareStatement(qry);
                    ps.setString(1,grp_id);
                    ResultSet rs=ps.executeQuery();
                    Map<String, JSONObject> roleMap = new HashMap<>();
                    while(rs.next()) {
                        String roleId = rs.getString("role_id");
                        String roleName = rs.getString("role_name");
                        String permissionId = rs.getString("permission_id");
                        String permissionName = rs.getString("permission_name");
                        String userId = rs.getString("user_id");
                        String name = rs.getString("name");
                        String mobileNumber = rs.getString("mobile_number");
                        if (!roleMap.containsKey(roleId)) {
                            JSONObject roleObject = new JSONObject();
                            roleObject.put("role_id", roleId);
                            roleObject.put("role_name", roleName);
                            roleObject.put("permissions", new JSONArray());
                            roleObject.put("members", new JSONArray());
                            roleMap.put(roleId, roleObject);
                        }
                        JSONArray permissionsArray = roleMap.get(roleId).getJSONArray("permissions");
                        boolean permissionExists = false;
                        for (int i = 0; i < permissionsArray.length(); i++) {
                            if (permissionsArray.getJSONObject(i).getString("permission_id").equals(permissionId)) {
                                permissionExists = true;
                                break;
                            }
                        }
                        if (!permissionExists) {
                            JSONObject permissionObject = new JSONObject();
                            permissionObject.put("permission_id", permissionId);
                            permissionObject.put("permission_name", permissionName);
                            permissionsArray.put(permissionObject);
                        }

                        if(userId != null) {
                            JSONObject memberObject = new JSONObject();
                            memberObject.put("user_id", userId);
                            memberObject.put("name", name);
                            memberObject.put("mobile_number", mobileNumber);
                            JSONArray membersArray = roleMap.get(roleId).getJSONArray("members");
                            boolean exists = false;
                            for (int i = 0; i < membersArray.length(); i++) {
                                if (membersArray.getJSONObject(i).getString("user_id").equals(userId)) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                membersArray.put(memberObject);
                            }
                        }

                    }
                    resultArray = new JSONArray(roleMap.values());
                    jsonResponse.put("roles", resultArray);


                }catch (SQLException e){
                    e.printStackTrace();
                }
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
}
