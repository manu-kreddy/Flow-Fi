package com.flowfi.controller;

import com.flowfi.model.Debt;
import com.flowfi.repository.DebtRepository;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private DebtService debtService;

    @Autowired(required = false)
    private DebtRepository debtRepository;

    // Backwards-compatible: keep path that accepts explicit userId for tests, but prefer authenticated /api/debts
    @GetMapping("/debts/{userId}")
    public List<Debt> getDebtsByPath(@PathVariable String userId) {
        return debtService.getDebts(userId);
    }

    @GetMapping("/debts")
    public List<Debt> getDebts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
        return debtService.getDebts(userId);
    }

    @org.springframework.web.bind.annotation.PostMapping("/debts")
    public Debt createDebt(@org.springframework.web.bind.annotation.RequestBody Debt debt) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : debt.getUserId();
        if (userId == null || userId.isEmpty()) userId = "dev-user";
        debt.setUserId(userId);
        return debtService.createDebt(debt);
    }

    @org.springframework.web.bind.annotation.PutMapping("/debts/{id}")
    public Object updateDebt(@PathVariable String id, @org.springframework.web.bind.annotation.RequestBody Debt debt) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";

        if (debtRepository != null) {
            var existing = debtRepository.findById(id);
            if (existing.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            if (!userId.equals(existing.get().getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        var opt = debtService.updateDebt(id, debt);
        if (opt.isPresent()) return opt.get();
        return Map.of("message", "Not found");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/debts/{id}")
    public Map<String, String> deleteDebt(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";

        if (debtRepository != null) {
            var existing = debtRepository.findById(id);
            if (existing.isPresent() && !userId.equals(existing.get().getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
            }
        }

        debtService.deleteDebt(id);
        return Map.of("message", "deleted");
    }

    @GetMapping("/repayment/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("debtFreeDate", LocalDate.now().plusMonths(18).toString());
        summary.put("monthlySchedule", debtService.getDebts("dev-user"));
        summary.put("strategy", "Snowball");
        return summary;
    }

    @GetMapping("/game/profile/{userId}")
    public Map<String, Object> getGameProfile(@PathVariable String userId) {
        return Map.of("xp", 120, "level", 2);
    }
}
