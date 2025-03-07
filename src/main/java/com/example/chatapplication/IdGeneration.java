package com.example.chatapplication;

import java.util.UUID;

public class IdGeneration {
    public static String generateRandomID() {
        return UUID.randomUUID().toString();
    }
}
