package com.flowfi.controller;

import com.flowfi.service.StrategyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/strategy")
public class StrategyController {

    @Autowired
    private StrategyService strategyService;

    @GetMapping
    public Map<String, Object> getStrategy(@RequestParam(required = false, defaultValue = "0") double extraPayment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
        return strategyService.computeStrategies(userId, extraPayment);
    }
}
