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

@WebServlet("/FetchGroupMembersKey")
public class FetchGroupMembersKeyServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String group_id = jsonObject.get("group_id").getAsString();
            List<JSONObject> membersKeys = new ArrayList<>();

            Connection con = DBconnection.getConnection();
            PreparedStatement ps =null;
            ResultSet rs = null;

            if(con!=null){

                String qryforkey ="select * from users where user_id !=? and user_id in (select user_id from group_members where grp_id =?)";
                try{
                    ps =con.prepareStatement(qryforkey);
                    ps.setString(1,sender_id);
                    ps.setString(2, group_id);
                    rs = ps.executeQuery();

                    while(rs.next()){
                        JSONObject memberKey = new JSONObject();
                        memberKey.put("user_id", rs.getString("user_id"));
                        memberKey.put("rsa_public_key", rs.getString("rsa_public_key"));
                        membersKeys.add(memberKey);
                    }

                    jsonResponse.put("Keys", new JSONArray(membersKeys));

                    response.setStatus(HttpServletResponse.SC_OK);
                   // System.out.println(jsonResponse.toString());

                }catch (SQLException e){
                    e.printStackTrace();
                    jsonResponse.put("error", e);
                }

            }
            else{
                jsonResponse.put("error", "Error on DB connection");
            }


        }
        else{

            jsonResponse.put("error", "Session token is invalid");


        }
        response.getWriter().write(jsonResponse.toString());


    }


}
