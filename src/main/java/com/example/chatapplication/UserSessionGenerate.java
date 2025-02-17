package com.example.chatapplication;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Date;
import static io.jsonwebtoken.Jwts.*;
import java.sql.*;




public class UserSessionGenerate {
    private static final String SECRET_KEY = "691a03c2f0a7a449a00a394ca9deca08a3c4602f0995d8376bc60884c184c991";
    private static final long EXPIRATION_TIME = 600000;


    public static String generateToken(String user_id,  HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String userIp = request.getRemoteAddr();
        return builder().setSubject(user_id).setIssuedAt(new Date()).claim("ip", userIp).claim("ua", userAgent).setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)).signWith(SignatureAlgorithm.HS256, SECRET_KEY).compact();
    }

    public static String  validateToken(String token,  HttpServletRequest request){
        Claims cal = Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getBody();
        String user_id = cal.getSubject();
        String tokenIp = cal.get("ip", String.class);
        String tokenUa = cal.get("ua", String.class);

        String currentIp = request.getRemoteAddr();
        String currentUa = request.getHeader("User-Agent");
        if (!tokenIp.equals(currentIp) || !tokenUa.equals(currentUa)) {
            return null;
        }

        Connection con = DBconnection.getConnection();
        PreparedStatement ps = null;
        if(con !=null){
            String qry ="select * from users where user_id=?";

            try{
                ps = con.prepareStatement(qry);
                ps.setString(1, user_id);
                ResultSet rs = ps.executeQuery();
                if(rs.next()){
                    return user_id;
                }

            }catch (SQLException e){
                e.printStackTrace();
            }

        }

        return null;

    }

}
