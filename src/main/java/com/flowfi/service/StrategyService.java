package com.flowfi.service;

import com.flowfi.model.Debt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StrategyService {

    @Autowired
    private DebtService debtService;

    public Map<String, Object> computeStrategies(String userId, double extraPayment) {
        if (extraPayment < 0) throw new IllegalArgumentException("extraPayment must be >= 0");
        List<Debt> debts = debtService.getDebts(userId);

        // Prepare orders
        List<Debt> snowballOrder = new ArrayList<>(debts);
        snowballOrder.sort(Comparator.comparingDouble(Debt::getRemainingBalance));

        List<Debt> avalancheOrder = new ArrayList<>(debts);
        avalancheOrder.sort(Comparator.comparingDouble(Debt::getInterestRate).reversed());

        Map<String, Object> snowballResult = simulatePlan(debts, snowballOrder, extraPayment);
        Map<String, Object> avalancheResult = simulatePlan(debts, avalancheOrder, extraPayment);

        double snowballInterest = ((Number) snowballResult.getOrDefault("totalInterest", 0)).doubleValue();
        double avalancheInterest = ((Number) avalancheResult.getOrDefault("totalInterest", 0)).doubleValue();

        String recommended = avalancheInterest <= snowballInterest ? "Avalanche" : "Snowball";
        double interestSaved = Math.max(0, snowballInterest - avalancheInterest);

        Map<String, Object> result = new HashMap<>();
        result.put("recommendedStrategy", recommended);
        result.put("interestSavedEstimate", Math.round(interestSaved * 100.0) / 100.0);
        result.put("snowball", snowballResult);
        result.put("avalanche", avalancheResult);

        return result;
    }

    private Map<String, Object> simulatePlan(List<Debt> sourceDebts, List<Debt> orderedDebts, double extraPayment) {
        // Deep copy debts into mutable state
        class State {
            String id;
            String loanName;
            double balance;
            double minPayment;
            double rate;
            boolean paid = false;
            int paidMonth = -1;
            double interestPaid = 0.0;
        }

        Map<String, State> states = new LinkedHashMap<>();
        for (Debt d : sourceDebts) {
            State s = new State();
            s.id = d.getId();
            s.loanName = d.getLoanName();
            s.balance = d.getRemainingBalance() > 0 ? d.getRemainingBalance() : d.getAmount();
            s.minPayment = d.getMinimumPayment();
            s.rate = d.getInterestRate();
            states.put(s.id, s);
        }

        List<String> orderIds = new ArrayList<>();
        for (Debt d : orderedDebts) orderIds.add(d.getId());

        int month = 0;
        int maxMonths = 1200; // safety cap (~100 years)
        double totalInterest = 0.0;
        List<Map<String, Object>> monthlySchedule = new ArrayList<>();
        double prevTotalRemaining = states.values().stream().mapToDouble(s -> s.balance).sum();
        int stagnantCount = 0;

        while (true) {
            boolean allPaid = true;
            for (State s : states.values()) {
                if (!s.paid) { allPaid = false; break; }
            }
            if (allPaid) break;
            if (++month > maxMonths) break;

            // rolled over amount is sum of minPayment of already-paid debts + extra monthly payment
            double rolledOver = extraPayment;
            for (State s : states.values()) if (s.paid) rolledOver += s.minPayment;

            // find current target: first in orderIds that's not paid
            String targetId = null;
            for (String id : orderIds) {
                if (!states.get(id).paid) { targetId = id; break; }
            }

            double monthTotalRemainingBefore = states.values().stream().mapToDouble(s -> s.balance).sum();
            double monthInterest = 0.0;
            List<Map<String, Object>> debtsSnapshot = new ArrayList<>();

            // simulate one month
            for (State s : states.values()) {
                Map<String, Object> dEntry = new HashMap<>();
                dEntry.put("loanId", s.id);
                dEntry.put("loanName", s.loanName);
                dEntry.put("balanceBefore", Math.round(s.balance * 100.0) / 100.0);

                if (s.paid) {
                    dEntry.put("interest", 0.0);
                    dEntry.put("payment", 0.0);
                    dEntry.put("balanceAfter", 0.0);
                    debtsSnapshot.add(dEntry);
                    continue;
                }

                double monthlyRate = s.rate / 100.0 / 12.0;
                double interest = s.balance * monthlyRate;

                double payment = s.minPayment;
                if (s.id.equals(targetId)) {
                    payment += rolledOver;
                }

                // Cap payment to remaining amount + interest
                double effectivePayment = Math.min(payment, s.balance + interest);

                double balanceAfter = s.balance + interest - effectivePayment;
                if (balanceAfter < 0) balanceAfter = 0.0;

                double principal = effectivePayment - interest;

                s.balance = balanceAfter;
                s.interestPaid += interest;
                monthInterest += interest;
                totalInterest += interest;

                if (s.balance <= 0.005 && !s.paid) {
                    s.paid = true;
                    s.paidMonth = month;
                    s.balance = 0.0;
                }

                dEntry.put("interest", Math.round(interest * 100.0) / 100.0);
                dEntry.put("payment", Math.round(effectivePayment * 100.0) / 100.0);
                dEntry.put("balanceAfter", Math.round(s.balance * 100.0) / 100.0);
                debtsSnapshot.add(dEntry);
            }

            double monthTotalRemainingAfter = states.values().stream().mapToDouble(s -> s.balance).sum();

            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("month", month);
            monthMap.put("debts", debtsSnapshot);
            monthMap.put("totalRemaining", Math.round(monthTotalRemainingAfter * 100.0) / 100.0);
            monthMap.put("interestThisMonth", Math.round(monthInterest * 100.0) / 100.0);
            monthMap.put("cumulativeInterest", Math.round(totalInterest * 100.0) / 100.0);
            monthlySchedule.add(monthMap);

            // detect stagnation / growth: if remaining doesn't decrease for several months, assume payments insufficient
            if (monthTotalRemainingAfter >= prevTotalRemaining - 0.0001) {
                stagnantCount++;
            } else {
                stagnantCount = 0;
            }
            prevTotalRemaining = monthTotalRemainingAfter;
            if (stagnantCount >= 6) {
                // stop simulation - unstable (payments insufficient to make progress)
                break;
            }
        }

        // Build payoff sequence
        List<Map<String, Object>> payoffSequence = new ArrayList<>();
        for (State s : states.values()) {
            Map<String, Object> m = new HashMap<>();
            m.put("loanId", s.id);
            m.put("loanName", s.loanName);
            m.put("monthsToPayoff", s.paidMonth == -1 ? null : s.paidMonth);
            m.put("interestPaid", Math.round(s.interestPaid * 100.0) / 100.0);
            payoffSequence.add(m);
        }

        Map<String, Object> out = new HashMap<>();
        out.put("orderedDebts", orderedDebts);
        out.put("payoffSequence", payoffSequence);
        out.put("totalMonths", month);
        out.put("totalInterest", Math.round(totalInterest * 100.0) / 100.0);
        out.put("monthlySchedule", monthlySchedule);
        out.put("explanation", "This plan applies minimum payments to all debts and, as each debt is cleared, rolls its minimum payment to the next target debt in the chosen order. If payments are insufficient to cover interest, the schedule will stop early and indicate limited progress.");
        return out;
    }
}
