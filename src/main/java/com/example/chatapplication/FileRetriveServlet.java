package com.example.chatapplication;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.*;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;
@WebServlet("/RetriveFile")
public class FileRetriveServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        String sender_id = UserSessionGenerate.validateToken(request);

        if(sender_id != null){
            String file_name = request.getParameter("file_name");  // Use GET parameter
            File imageFile = new File(getServletContext().getRealPath("") + "/uploads/" + file_name);

            if (!imageFile.exists()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found");
                return;
            }

            response.setContentType(Files.probeContentType(imageFile.toPath())); // Set correct image type
            response.setContentLength((int) imageFile.length());

            try (FileInputStream fis = new FileInputStream(imageFile);
                 OutputStream out = response.getOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }
        }
    }
}
