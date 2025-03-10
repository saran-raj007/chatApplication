package com.example.chatapplication;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.*;
import org.json.JSONObject;

@WebServlet("/GetRoleDesc")
public class GetRoleDescription extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if (sender_id != null) {
            JsonObject role = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String role_id = role.get("role_id").getAsString();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps;
            ResultSet rs;

            if(con != null){
                String query = "select * from roles where role_id=?";
                try{
                    ps = con.prepareStatement(query);
                    ps.setString(1, role_id);
                    rs = ps.executeQuery();
                    if(rs.next()){
                        jsonResponse.put("role_id", role_id);
                        jsonResponse.put("role_name", rs.getString("role_name"));
                        jsonResponse.put("role_desc", rs.getString("role_description"));

                    }

                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            else{
                jsonResponse.put("error", "Error on DB connection");

            }

        }
        else{
            jsonResponse.put("error", "Invalid token");
        }
        response.getWriter().write(jsonResponse.toString());
    }
}
