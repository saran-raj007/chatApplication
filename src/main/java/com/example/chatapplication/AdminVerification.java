package com.example.chatapplication;

import java.sql.*;

public class AdminVerification {

    public static boolean adminVerfiy(String user_id,String grp_id)  {
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        if(con != null) {
            String vquery ="select * from group_members where user_id =? and grp_id =? and isAdmin=?";

            try{
                ps = con.prepareStatement(vquery);
                ps.setString(1, user_id);
                ps.setString(2, grp_id);
                ps.setBoolean(3, true);
                ResultSet rs = ps.executeQuery();
                return rs.next();

            }catch (SQLException e){
                e.printStackTrace();
            }


        }
        return false;
    }
}
