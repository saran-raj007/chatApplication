package com.example.chatapplication;
import org.mindrot.jbcrypt.BCrypt;


public class PasswordHashing {
    private static final String salt = BCrypt.gensalt(12);

    public static String hashPassword(String password){
        return BCrypt.hashpw(password, salt);
    }

    public static boolean checkPassword(String password,String hashedPassword){
        return BCrypt.checkpw(password, hashedPassword);

    }

}
