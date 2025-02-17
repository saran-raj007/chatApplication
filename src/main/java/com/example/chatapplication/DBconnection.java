package com.example.chatapplication;

import java.sql.*;

public class DBconnection {

    private static final String DBURL="jdbc:mysql://localhost:3306/chatapp";
    private static final String USER="ram";
    private static final String PASS="Ramkumar@77";
    public static Connection getConnection(){
        Connection con=null;
        try{
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Class.forName("com.mysql.cj.jdbc.Driver");

            con=DriverManager.getConnection(DBURL,USER,PASS);
            if(con!=null){
                return con;
            }

        } catch (SQLException  | ClassNotFoundException e) {
            e.printStackTrace();

        }
        return null;
    }
}