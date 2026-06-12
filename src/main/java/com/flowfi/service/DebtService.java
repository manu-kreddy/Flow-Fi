package com.flowfi.service;

import com.flowfi.model.Debt;
import com.flowfi.repository.DebtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DebtService {

    @Autowired(required = false)
    private DebtRepository debtRepository;

    public List<Debt> getDebts(String userId) {
        if (debtRepository != null) {
            List<Debt> found = debtRepository.findByUserId(userId);
            if (found != null && !found.isEmpty()) return found;
        }

        // Fallback in-memory sample debts for development/demo
        List<Debt> debts = new ArrayList<>();
        debts.add(new Debt("loan-1", userId, "Home Loan", 150000, 145000, 5000, 6.5));
        debts.add(new Debt("loan-2", userId, "Car Loan", 50000, 18000, 3000, 8.0));
        debts.add(new Debt("loan-3", userId, "Credit Card", 15000, 6000, 2000, 18.0));
        return debts;
    }

    public Debt createDebt(Debt debt) {
        if (debt.getId() == null || debt.getId().isEmpty()) debt.setId(UUID.randomUUID().toString());
        if (debtRepository != null) return debtRepository.save(debt);
        return debt;
    }

    public Optional<Debt> updateDebt(String id, Debt patch) {
        if (debtRepository == null) return Optional.empty();
        return debtRepository.findById(id).map(existing -> {
            if (patch.getLoanName() != null) existing.setLoanName(patch.getLoanName());
            if (patch.getLenderName() != null) existing.setLenderName(patch.getLenderName());
            existing.setPrincipalAmount(patch.getPrincipalAmount());
            existing.setRemainingAmount(patch.getRemainingAmount());
            existing.setMonthlyEMI(patch.getMonthlyEMI());
            existing.setInterestRate(patch.getInterestRate());
            if (patch.getDueDate() != null) existing.setDueDate(patch.getDueDate());
            return debtRepository.save(existing);
        });
    }

    public void deleteDebt(String id) {
        if (debtRepository != null) debtRepository.deleteById(id);
    }

    public Optional<Debt> findById(String id) {
        if (debtRepository == null) return Optional.empty();
        return debtRepository.findById(id);
    }
}

