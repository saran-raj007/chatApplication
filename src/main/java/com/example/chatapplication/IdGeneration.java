package com.example.chatapplication;

import java.util.*;

public class IdGeneration {
    private static  final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static String generateRandomID() {
        StringBuilder userId = new StringBuilder();
        Random rand = new Random();
        for (int i = 0; i < 10; i++) {
            userId.append(chars.charAt(rand.nextInt(chars.length())));
        }
        return userId.toString();
    }
}


