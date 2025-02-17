package com.example.chatapplication;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import   java.util.*;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.sql.*;

@WebServlet("/SignupServlet")
public class SignupServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        JsonObject jsonObject = JsonParser.parseReader(new InputStreamReader(request.getInputStream())).getAsJsonObject();
        String username = jsonObject.get("user_name").getAsString();
        String mobileNumber = jsonObject.get("mobile_number").getAsString();
        String password = jsonObject.get("user_pass").getAsString();
        String rsa_pubkey = jsonObject.get("rsa_pubkey").getAsString();
        password = PasswordHashing.hashPassword(password);
        Connection con = null;
        PreparedStatement ps = null;
        con = DBconnection.getConnection();
        JSONObject jsonResponse = new JSONObject();
        response.setContentType("application/json");
        if(con != null) {
            String usr_exist="select * from users where mobile_number = ?";
            String qry ="INSERT INTO users (user_id, name, mobile_number, password,rsa_public_key) VALUES (?, ?, ?, ?,?)";
            try{
                ps =con.prepareStatement(usr_exist);
                ps.setString(1,mobileNumber);
                ResultSet rs =ps.executeQuery();
                if(rs.next()) {
                    response.getWriter().write("{\"status\":\"error\" ,\"message\":\"mobile number already exists\"}");
                }
                else{
                    ps = con.prepareStatement(qry);
                    String usrid = IdGeneration.generateRandomID();
                    ps.setString(1,usrid);
                    ps.setString(2,username);
                    ps.setString(3,mobileNumber);
                    ps.setString(4,password);
                    ps.setString(5,rsa_pubkey);

                    int rowinset = ps.executeUpdate();
                    if(rowinset > 0) {

                        String token = UserSessionGenerate.generateToken(usrid,request);
                        Cookie jwtCookie = new Cookie("SessID", token);
                        jwtCookie.setPath("/");
                        jwtCookie.setHttpOnly(true);
                        jwtCookie.setSecure(true);
                        jwtCookie.setMaxAge(10*60);
                        jwtCookie.setAttribute("SameSite", "Lax");
                        response.addCookie(jwtCookie);



                        response.getWriter().write("{\"status\":\"success\" , \"message\":\"new user has been registered\"}");
                    }
                    else{
                        response.getWriter().write("{\"status\":\"error\" , \"message\":\"ERROR ON USER REGISTRATION\"}");

                    }
                }

            }catch (SQLException e){
                e.printStackTrace();

                response.getWriter().write("{\"status\":\"error\" ,\"message\":\"ERROR ON DB CONNECTION\"}");
            }
        }
        else{

            response.getWriter().write("{\"status\":\"error\" ,\"message\":\"ERROR ON DB CONNECTION\"}");

        }



    }

}
