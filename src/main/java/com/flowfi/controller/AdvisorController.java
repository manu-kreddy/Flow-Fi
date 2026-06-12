package com.flowfi.controller;

import com.flowfi.model.AdvisorResponse;
import com.flowfi.model.ChatRequest;
import com.flowfi.model.ChatResponse;
import com.flowfi.service.AIAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AdvisorController {

    @Autowired
    private AIAdvisorService advisorService;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
    }

    @GetMapping({"/advisor/{userId}", "/api/advisor/{userId}"})
    public AdvisorResponse getAdvisor(@PathVariable String userId) {
        String current = currentUserId();
        if (!current.equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        return advisorService.getAdvisor(userId);
    }

    @PostMapping({"/advisor/{userId}/chat", "/api/advisor/{userId}/chat"})
    public ChatResponse chat(@PathVariable String userId, @RequestBody ChatRequest request) {
        String current = currentUserId();
        if (!current.equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        return advisorService.chat(userId, request.getMessage());
    }
}
