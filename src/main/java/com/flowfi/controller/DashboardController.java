package com.flowfi.controller;

import com.flowfi.model.Dashboard;
import com.flowfi.model.Debt;
import com.flowfi.service.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping({"/dashboard", "/api/dashboard"})
public class DashboardController {

    @Autowired
    private DebtService debtService;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
    }

    @GetMapping("/{userId}")
    public Dashboard getDashboardForUser(@PathVariable String userId) {
        String current = currentUserId();
        if (!current.equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");

        List<Debt> debts = debtService.getDebts(userId);

        double totalDebt = 0.0;
        double totalEMI = 0.0;
        double totalPrincipal = 0.0;
        int loanCount = 0;

        for (Debt d : debts) {
            loanCount++;
            double principal = d.getPrincipalAmount();
            double remaining = d.getRemainingAmount();
            totalPrincipal += principal;
            totalDebt += remaining;
            totalEMI += d.getMonthlyEMI();
        }

        double progress = 0.0;
        if (totalPrincipal > 0) {
            progress = (1.0 - (totalDebt / totalPrincipal)) * 100.0;
            if (progress < 0) progress = 0.0;
            if (progress > 100) progress = 100.0;
            progress = Math.round(progress * 100.0) / 100.0;
        } else {
            progress = loanCount == 0 ? 0.0 : 0.0;
        }

        return new Dashboard(totalDebt, totalEMI, loanCount, progress);
    }

    @GetMapping
    public Dashboard getDashboardForCurrentUser() {
        return getDashboardForUser(currentUserId());
    }
}
