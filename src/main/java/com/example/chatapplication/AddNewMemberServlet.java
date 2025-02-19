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
@WebServlet("/AddNewMembers")
public class AddNewMemberServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String stoken = cookieExtract(request);
        String sender_id = UserSessionGenerate.validateToken(stoken,request);
        JSONObject jsonResponse = new JSONObject();
        if(stoken != null && sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grp_id = jsonObject.get("grp_id").getAsString();
            String added_by = jsonObject.get("added_by").getAsString();
            JsonArray jsonArray = jsonObject.getAsJsonArray("grpMembers");
            List<String> groupMembers = new ArrayList<>();
            for (JsonElement element : jsonArray) {
                groupMembers.add(element.getAsString());
            }
            Connection con = DBconnection.getConnection();
            PreparedStatement ps =null;

            if(con!=null){
                String qryForNewMember = "insert into group_members (id,grp_id,user_id,isAdmin,added_by) values(?,?,?,?,?)";

                try{
                    ps=con.prepareStatement(qryForNewMember);
                    for(String member:groupMembers){
                        ps.setString(1, IdGeneration.generateRandomID());
                        ps.setString(2, grp_id);
                        ps.setString(3, member);
                        ps.setBoolean(4,false);
                        ps.setString(5, added_by);

                        int rowinserted = ps.executeUpdate();
                        if(rowinserted>0){
                            jsonResponse.put("success", "new MEmbers Added");
                        }
                        else{
                            jsonResponse.put("error", "Error on add Members");
                        }

                    }
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
    private String cookieExtract(HttpServletRequest request){
        Cookie[] cookies = request.getCookies();

        if (cookies != null){
            for (Cookie cookie : cookies){
                if("SessID".equals(cookie.getName())){
                    return  cookie.getValue();

                }
            }
        }
        return null;

    }
}
