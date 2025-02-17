package com.example.chatapplication;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;

@WebServlet("/Logout")
public class LogoutSevlet extends HttpServlet {

    public void doPost(HttpServletRequest request,HttpServletResponse response) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
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
