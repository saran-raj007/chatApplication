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
    public static boolean  OperationVerify(String sender_id,String grp_id,String name){
        Connection con = DBconnection.getConnection();
        PreparedStatement ps;
        ResultSet rs;
        if(con != null) {
            String qry = "select p.permission_name from member_roles mr join role_permissions rp on mr.role_id = rp.role_id join permissions p on rp.permission_id = p.permission_id where mr.member_id = ? and mr.group_id = ? and p.permission_name = ?";
            try {
                ps = con.prepareStatement(qry);
                ps.setString(1, sender_id);
                ps.setString(2, grp_id);
                ps.setString(3, name);
                rs = ps.executeQuery();
                return rs.next();

            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return false;

    }
}
