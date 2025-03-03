package com.example.chatapplication;

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
import org.json.JSONObject;

import java.io.InputStreamReader;
import java.sql.*;




@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    public  void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


        JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
        String mobileNumber = jsonObject.get("user_mbnum").getAsString();
        String password = jsonObject.get("user_pass").getAsString();

        Connection con =DBconnection.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        response.setContentType("application/json");
        JSONObject respo = new JSONObject();
        if(con!=null) {

            String qry ="SELECT * FROM users WHERE mobile_number = ?";
            try{
                ps = con.prepareStatement(qry);
                ps.setString(1,mobileNumber);
                rs = ps.executeQuery();

                if(rs.next()) {
                    String encpass = rs.getString("password");
                    String usrid = rs.getString("user_id");

                    if(PasswordHashing.checkPassword(password,encpass)){
                        String token = UserSessionGenerate.generateToken(usrid,request);
                        Cookie jwtCookie = new Cookie("SessID", token);
                        jwtCookie.setPath("/");
                        jwtCookie.setHttpOnly(true);
                        jwtCookie.setSecure(!request.getServerName().equals("localhost"));
                        jwtCookie.setMaxAge(24*60*10);
                        jwtCookie.setAttribute("SameSite", "None");
                        response.addCookie(jwtCookie);
                        response.setHeader("Set-Cookie", "SessID=" + token + "; Path=/; HttpOnly; Secure; SameSite=None");
                        respo.put("message", "Login Successful");
                        response.getWriter().write(respo.toString());
                        response.setStatus(HttpServletResponse.SC_OK);

                    }
                    else{
                        respo.put("message", "Invalid username or password");
                        response.getWriter().write(respo.toString());
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    }
                }
            }catch (SQLException e){
                e.printStackTrace();
                respo.put("message", "Something went wrong");
                response.getWriter().write(respo.toString());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }
        else{

            respo.put("message", "Something went wrong");
            response.getWriter().write(respo.toString());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        }

    }
}
