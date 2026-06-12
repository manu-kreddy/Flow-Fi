package com.flowfi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final ConcurrentHashMap<String, Map<String, String>> usersByEmail = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String passwordHash = body.get("passwordHash");

        if (email == null || passwordHash == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing fields"));
        }

        if (usersByEmail.containsKey(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already registered"));
        }

        String userId = UUID.randomUUID().toString();
        Map<String, String> user = Map.of(
                "userId", userId,
                "name", name == null ? "" : name,
                "email", email,
                "passwordHash", passwordHash
        );

        usersByEmail.put(email, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User created", "userId", userId));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing fields"));
        }

        Map<String, String> user = usersByEmail.get(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        String stored = user.get("passwordHash");
        if (!password.equals(stored)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        String token = "mock-token-" + UUID.randomUUID();
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.get("userId"),
                "name", user.get("name")
        ));
    }
}
