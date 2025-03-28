package com.example.chatapplication;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;


@WebServlet("/ChatServlet")
public class ChatServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String usrid = UserSessionGenerate.validateToken(request);
        if(usrid!=null){
            List<JSONObject> userList = new ArrayList<>();
            List<JSONObject> groupList = new ArrayList<>();

            Connection con=DBconnection.getConnection();
            PreparedStatement ps =null;
            JSONObject curruser = new JSONObject();
            if(con!=null){
                 String qry ="select * from users";
                 String qry_grp ="select cg.*, count(m.user_id) as unseen from chat_groups cg left join mentions m on cg.group_id=m.group_id and m.user_id=? and m.seen=false    where cg.group_id in (select grp_id from group_members where user_id =?)  group by cg.group_id";
                 try{
                     ps = con.prepareStatement(qry);
//                     ps.setString(1,usrid);
                     ResultSet rs = ps.executeQuery();

                     while(rs.next()){
                         JSONObject user = new JSONObject();
                         String userId = rs.getString("user_id");
                         if(WebSocketServer.userSessions.containsKey(userId)){
                             user.put("status", "online");
                         }
                         else{
                             user.put("status", "offline");
                         }
                         user.put("type","private");
                         user.put("user_id", userId);
                         user.put("name", rs.getString("name"));
                         user.put("mobile_number", rs.getString("mobile_number"));
                         user.put("last_seen", rs.getString("last_seen"));
                         user.put("rsa_public_key", rs.getString("rsa_public_key"));
                         if(userId.equals(usrid)) {
                             curruser = user;
                         }
                         else{
                             userList.add(user);
                         }

                     }
                     ps = con.prepareStatement(qry_grp);
                     ps.setString(1, usrid);
                     ps.setString(2, usrid);
                     rs = ps.executeQuery();
                     while(rs.next()){
                         JSONObject grp = new JSONObject();
                         grp.put("type","group");
                         grp.put("group_id", rs.getString("group_id"));
                         grp.put("name", rs.getString("name"));
                         grp.put("created_by", rs.getString("created_by"));
                         grp.put("unseen", (rs.getInt("unseen") > 0));
                         groupList.add(grp);
                     }
                     JSONObject jsonResponse = new JSONObject();
                     jsonResponse.put("users", new JSONArray(userList));
                     jsonResponse.put("groups", new JSONArray(groupList));
                     jsonResponse.put("curruser", curruser);
                     response.getWriter().write(jsonResponse.toString());

                 }catch (SQLException e){
                     e.printStackTrace();

                     response.getWriter().write("Unauthorized: No token found");
                 }
            }
        }
        else{
            response.getWriter().write("Unauthorized: No token found");

        }

    }


}
