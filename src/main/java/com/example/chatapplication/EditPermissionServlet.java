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
import org.json.JSONObject;

@WebServlet("/EditPermission")
public class EditPermissionServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String role_id = jsonObject.get("role_id").getAsString();
            String permission_id = jsonObject.get("permission_id").getAsString();
            boolean ischecked = jsonObject.get("ischeck").getAsBoolean();
            if(!AdminVerification.adminVerfiy(sender_id, grp_id)) {
                jsonResponse.put("message","unauthorized access");
                response.getWriter().write(jsonResponse.toString());
                return;
            }
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            if(con != null) {
                String qry_delete="delete  from role_permissions where role_id=? and permission_id=?";
                String qry_insert ="insert into role_permissions (id,role_id,permission_id) values(?,?,?)";
                try{
                    if(ischecked){
                        ps = con.prepareStatement(qry_insert);
                        ps.setString(1,IdGeneration.generateRandomID());
                        ps.setString(2,role_id);
                        ps.setString(3,permission_id);

                    }
                    else{
                        ps = con.prepareStatement(qry_delete);
                        ps.setString(1,role_id);
                        ps.setString(2,permission_id);
                    }
                    ps.executeUpdate();
                    jsonResponse.put("message","updated permissions");

                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("message","Error on db");
            }

        }
        else{
            jsonResponse.put("message","unauthorized access");
        }
        response.getWriter().write(jsonResponse.toString());
    }
}
