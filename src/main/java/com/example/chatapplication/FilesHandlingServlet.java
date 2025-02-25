package com.example.chatapplication;

import jakarta.servlet.*;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.File;
import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;
@MultipartConfig
@WebServlet("/FilesHandling")
public class FilesHandlingServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);
        JSONObject jsonResponse = new JSONObject();
        if(sender_id != null){
            Part filePart = request.getPart("sticker");
            String uniqueFileName = UUID.randomUUID().toString() + ".png";
            String uploadPath = getServletContext().getRealPath("") + File.separator + "uploads";
            System.out.println(uploadPath);
            Path filePath = Paths.get(uploadPath, uniqueFileName);
            Files.copy(filePart.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            jsonResponse.put("file_name", uniqueFileName);
            response.getWriter().write(jsonResponse.toString());
        }
        else{
            jsonResponse.put("message", "unauthorized");
            response.getWriter().write(jsonResponse.toString());
        }


    }


}
