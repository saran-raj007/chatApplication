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

@WebServlet("/RoleChange")
public class RoleChangeServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null) {
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String member_id=jsonObject.get("member_id").getAsString();
            String grp_id=jsonObject.get("grp_id").getAsString();
            if(!AdminVerification.adminVerfiy(sender_id,grp_id)){
                jsonResponse.put("message","unauthorized access");
                response.getWriter().write(jsonResponse.toString());
                return;
            }
            boolean state=jsonObject.get("state").getAsBoolean();
            Connection con =DBconnection.getConnection();
            PreparedStatement ps =null;
            if(con != null){
                String qryForRole="update group_members set isAdmin=? where grp_id=? and user_id=?";
                try{
                    ps=con.prepareStatement(qryForRole);
                    ps.setBoolean(1,state);
                    ps.setString(2,grp_id);
                    ps.setString(3,member_id);
                    int rowupdate=ps.executeUpdate();
                    if(rowupdate>0){
                        jsonResponse.put("message","Role changed");
                        response.getWriter().write(jsonResponse.toString());
                    }
                    else{
                        jsonResponse.put("message","Error on Role change");
                        response.getWriter().write(jsonResponse.toString());
                    }

                }catch (SQLException e){
                    e.printStackTrace();
                    jsonResponse.put("message","Error on DB");
                    response.getWriter().write(jsonResponse.toString());

                }
            }

        }
        else{
            jsonResponse.put("message","unauthorized access");
            response.getWriter().write(jsonResponse.toString());

        }
    }



}
