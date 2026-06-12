package com.flowfi.controller;

import com.flowfi.model.Debt;
import com.flowfi.repository.DebtRepository;
import com.flowfi.service.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/debts")
public class DebtController {

    @Autowired
    private DebtService debtService;

    @Autowired(required = false)
    private DebtRepository debtRepository;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
    }

    @PostMapping
    public Debt createDebt(@RequestBody Debt debt) {
        String userId = currentUserId();
        debt.setUserId(userId);
        if (debt.getCreatedAt() == null) debt.setCreatedAt(Instant.now());
        return debtService.createDebt(debt);
    }

    @GetMapping("/user/{userId}")
    public List<Debt> getDebtsForUser(@PathVariable String userId) {
        String current = currentUserId();
        if (!current.equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        return debtService.getDebts(userId);
    }

    @GetMapping
    public List<Debt> getCurrentUserDebts() {
        return debtService.getDebts(currentUserId());
    }

    @PutMapping("/{id}")
    public Debt updateDebt(@PathVariable String id, @RequestBody Debt patch) {
        if (debtRepository != null) {
            Optional<Debt> found = debtRepository.findById(id);
            if (found.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
            if (!currentUserId().equals(found.get().getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        var opt = debtService.updateDebt(id, patch);
        return opt.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteDebt(@PathVariable String id) {
        if (debtRepository != null) {
            Optional<Debt> found = debtRepository.findById(id);
            if (found.isPresent() && !currentUserId().equals(found.get().getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        debtService.deleteDebt(id);
    }
}
