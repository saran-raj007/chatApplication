package com.example.chatapplication;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/Logout")
public class LogoutSevlet extends HttpServlet {

    public void doPost(HttpServletRequest request,HttpServletResponse response) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
        String usrid = UserSessionGenerate.validateToken(request);
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        if(con != null) {
            String query = "update users set last_seen=NOW() where user_id=?";

            try{
                ps=con.prepareStatement(query);
                ps.setString(1,usrid);
                int rows = ps.executeUpdate();
                if(rows > 0) {
                    System.out.println("User last seen updated successfully");
                }
                else{
                    System.out.println("User last seen updated  unsuccessfully");
                }
            }catch (SQLException e){
                e.printStackTrace();
            }
        }

        if(usrid != null) {
            WebSocketServer.userSessions.get(usrid);
            WebSocketServer wbs = new WebSocketServer();
            wbs.onClose(WebSocketServer.userSessions.get(usrid),usrid);
        }
        if(session != null){
            session.invalidate();
        }
        Cookie sessionCookie = new Cookie("SessID", "");
        sessionCookie.setMaxAge(0);
        sessionCookie.setPath("/");
        response.addCookie(sessionCookie);
        response.getWriter().write("Logout successful");
    }

}
