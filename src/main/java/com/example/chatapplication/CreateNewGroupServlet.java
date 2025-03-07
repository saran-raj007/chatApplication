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

@WebServlet("/CreateNewGroup")
public class CreateNewGroupServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
            String grpname = jsonObject.get("name").getAsString();
            String admin_id = jsonObject.get("Admin_id").getAsString();
            JsonArray jsonArray = jsonObject.getAsJsonArray("grpMembers");
            List<String> groupMembers = new ArrayList<>();
            for (JsonElement element : jsonArray) {
                groupMembers.add(element.getAsString());
            }
            Connection con = DBconnection.getConnection();
            PreparedStatement ps =null;

            if(con!=null){
                String qry ="insert into chat_groups (group_id, name, created_by) values (?,?,?)";
                String qry_gm ="insert into group_members (id, grp_id,user_id,isAdmin,added_by) values (?,?,?,?,?)";
                String grp_id = IdGeneration.generateRandomID();
                try{
                    ps =con.prepareStatement(qry);
                    ps.setString(1, grp_id);
                    ps.setString(2, grpname);
                    ps.setString(3, admin_id);
                    int rowinserted = ps.executeUpdate();
                    if(rowinserted>0){
                        addDefaultRole(grp_id,groupMembers);
                        jsonResponse.put("grp_id", grp_id);
                        jsonResponse.put("success", "Group created");
                    }
                    else{
                        jsonResponse.put("error", "Error on creating group");

                    }
                    ps=con.prepareStatement(qry_gm);
                    for(String member:groupMembers){
                        ps.setString(1, IdGeneration.generateRandomID());
                        ps.setString(2, grp_id);
                        ps.setString(3, member);
                        ps.setBoolean(4,false);
                        ps.setString(5, admin_id);

                        rowinserted = ps.executeUpdate();
                        if(rowinserted>0){

                            jsonResponse.put("success", "Group  Added");
                        }
                        else{
                            jsonResponse.put("error", "Error on add Members");
                        }
                    }
                    ps.setString(1, IdGeneration.generateRandomID());
                    ps.setString(2, grp_id);
                    ps.setString(3, admin_id);
                    ps.setBoolean(4,true);
                    ps.setString(5, admin_id);
                    rowinserted = ps.executeUpdate();
                    addPermissionToAdmin(admin_id,grp_id);
                    if(rowinserted>0){
                        jsonResponse.put("success", "Group created");
                    }
                    else{
                        jsonResponse.put("error", "Error on add Admin");

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
    private void addDefaultRole(String grp_id, List<String> groupMembers){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con!=null){
            String qry ="insert into roles (role_id,group_id,role_name,role_description) values (?,?,?,?)";

            try{
                String role_id = IdGeneration.generateRandomID();
                ps =con.prepareStatement(qry);
                ps.setString(1, role_id);
                ps.setString(2, grp_id);
                ps.setString(3,"Member");
                ps.setString(4, "This is a default role for group members");
                int rowinserted = ps.executeUpdate();

                String qryrp ="insert into role_permissions (id,role_id,permission_id) values (?,?, (SELECT permission_id FROM permissions WHERE permission_name = 'Send Message'))";
                String role_permission_id = IdGeneration.generateRandomID();
                ps =con.prepareStatement(qryrp);
                ps.setString(1, role_permission_id);
                ps.setString(2, role_id);
                ps.executeUpdate();

                String qrymr ="insert into member_roles (id,member_id,group_id,role_id) values (?,?,?,?)";
                ps =con.prepareStatement(qrymr);
                for(String member:groupMembers) {
                    String member_role_id = IdGeneration.generateRandomID();
                    ps.setString(1, member_role_id);
                    ps.setString(2, member);
                    ps.setString(3, grp_id);
                    ps.setString(4, role_id);
                    ps.executeUpdate();
                }
            }catch (SQLException e){
                e.printStackTrace();
            }
        }

    }

    private void addPermissionToAdmin(String admin_id, String grp_id){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;

        if(con!=null){
            String qry ="insert into roles (role_id,group_id,role_name,role_description) values (?,?,?,?)";

            try{
                String role_id = IdGeneration.generateRandomID();
                ps =con.prepareStatement(qry);
                ps.setString(1, role_id);
                ps.setString(2, grp_id);
                ps.setString(3,"Admin");
                ps.setString(4, "This is a Admin Role. Those who have this role can able to do all operations");
                int rowinserted = ps.executeUpdate();
                String qryforPer="select permission_id from permissions";
                ps =con.prepareStatement(qryforPer);
                ResultSet rs = ps.executeQuery();
                String qryrp ="INSERT INTO role_permissions (id,role_id, permission_id) values (?,?,?)";

                ps =con.prepareStatement(qryrp);
                while(rs.next()){
                    String role_permission_id = IdGeneration.generateRandomID();
                    ps.setString(1, role_permission_id);
                    ps.setString(2, role_id);
                    ps.setString(3, rs.getString("permission_id"));
                    ps.executeUpdate();
                }


                String qrymr ="insert into member_roles (id,member_id,group_id,role_id) values (?,?,?,?)";
                ps =con.prepareStatement(qrymr);
                    String member_role_id = IdGeneration.generateRandomID();
                    ps.setString(1, member_role_id);
                    ps.setString(2, admin_id);
                    ps.setString(3, grp_id);
                    ps.setString(4, role_id);
                    ps.executeUpdate();






            }catch (SQLException e){
                e.printStackTrace();
            }

        }

    }

}
