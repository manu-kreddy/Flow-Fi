package com.flowfi.controller;

import com.flowfi.model.SimulationRequest;
import com.flowfi.model.SimulationResult;
import com.flowfi.model.Debt;
import com.flowfi.repository.DebtRepository;
import com.flowfi.service.DebtService;
import com.flowfi.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping
public class SimulationController {

    @Autowired
    private DebtService debtService;

    @Autowired
    private SimulationService simulationService;

    @Autowired(required = false)
    private DebtRepository debtRepository;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getPrincipal() instanceof String) ? (String) auth.getPrincipal() : "dev-user";
    }

    @PostMapping({"/api/simulation", "/api/simulate", "/simulation", "/simulate"})
    public SimulationResult simulate(@RequestBody SimulationRequest req) {
        if (req == null || req.getLoanId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "loanId required");

        Optional<Debt> opt = debtService.findById(req.getLoanId());
        if (opt.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found");
        Debt debt = opt.get();

        // ownership check when repository present
        if (debtRepository != null && !currentUserId().equals(debt.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");

        return simulationService.simulate(debt, req.getExtraPayment());
    }
}
