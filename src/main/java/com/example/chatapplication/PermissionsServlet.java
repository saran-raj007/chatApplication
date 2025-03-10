package com.example.chatapplication;


import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
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
