package com.flowfi.service;

import com.flowfi.model.Debt;
import com.flowfi.model.SimulationResult;
import org.springframework.stereotype.Service;

@Service
public class SimulationService {

    private static class Outcome {
        int months;
        double totalInterest;
        Outcome(int months, double totalInterest) { this.months = months; this.totalInterest = totalInterest; }
    }

    public SimulationResult simulate(Debt debt, double extraPayment) {
        double principal = pickPrincipal(debt);
        double monthlyRate = (debt.getInterestRate() / 100.0) / 12.0;

        double currentPayment = debt.getMonthlyEMI();
        if (currentPayment <= 0) {
            // fallback reasonable payment: principal/60 or interest+1 whichever larger
            double fallback = Math.max(principal / 60.0, Math.ceil(principal * monthlyRate) + 1);
            currentPayment = fallback;
        }

        Outcome oCurrent = runSimulation(principal, currentPayment, monthlyRate);
        Outcome oNew = runSimulation(principal, currentPayment + extraPayment, monthlyRate);

        double interestSaved = oCurrent.totalInterest - oNew.totalInterest;
        int currentMonths = oCurrent.months < 0 ? -1 : oCurrent.months;
        int newMonths = oNew.months < 0 ? -1 : oNew.months;

        return new SimulationResult(currentMonths, newMonths, round2(interestSaved), round2(oCurrent.totalInterest), round2(oNew.totalInterest));
    }

    private double pickPrincipal(Debt debt) {
        double p = debt.getRemainingAmount();
        if (p <= 0) p = debt.getPrincipalAmount();
        if (p <= 0) p = debt.getAmount();
        return Math.max(0.0, p);
    }

    private Outcome runSimulation(double principal, double monthlyPayment, double monthlyRate) {
        if (principal <= 0) return new Outcome(0, 0.0);
        final int MAX_MONTHS = 1000; // safety cap ~80 years
        double remaining = principal;
        double totalInterest = 0.0;
        int months = 0;

        for (; months < MAX_MONTHS && remaining > 0.005; months++) {
            double interest = remaining * monthlyRate;
            totalInterest += interest;
            double principalPaid = monthlyPayment - interest;
            if (principalPaid <= 0) {
                // payment too small; will never amortize
                return new Outcome(-1, Double.POSITIVE_INFINITY);
            }
            remaining -= principalPaid;
            if (remaining < 0) remaining = 0;
        }

        if (remaining > 0.005) return new Outcome(-1, Double.POSITIVE_INFINITY);
        return new Outcome(months, totalInterest);
    }

    private double round2(double v) {
        if (Double.isInfinite(v) || Double.isNaN(v)) return v;
        return Math.round(v * 100.0) / 100.0;
    }
}
