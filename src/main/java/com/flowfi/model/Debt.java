package com.flowfi.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "debts")
public class Debt {
    @Id
    private String id;
    private String userId;
    private String loanName;
    private String lenderName;

    // canonical field names (new schema)
    private double principalAmount;
    private double remainingAmount;
    private double interestRate;
    private double monthlyEMI;
    private LocalDate dueDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant createdAt;

    public Debt() {}

    // Backwards-compatible constructor matching legacy usages (amount, remainingBalance, minimumPayment)
    public Debt(String id, String userId, String loanName, double amount, double remainingBalance, double minimumPayment, double interestRate) {
        this.id = id;
        this.userId = userId;
        this.loanName = loanName;
        this.principalAmount = amount;
        this.remainingAmount = remainingBalance;
        this.monthlyEMI = minimumPayment;
        this.interestRate = interestRate;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getLoanName() {
        return loanName;
    }

    public void setLoanName(String loanName) {
        this.loanName = loanName;
    }

    public String getLenderName() {
        return lenderName;
    }

    public void setLenderName(String lenderName) {
        this.lenderName = lenderName;
    }

    public double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public double getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(double remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public double getMonthlyEMI() {
        return monthlyEMI;
    }

    public void setMonthlyEMI(double monthlyEMI) {
        this.monthlyEMI = monthlyEMI;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // Legacy-compatible getters/setters for older code / data (amount, remainingBalance, minimumPayment)
    public double getAmount() { return getPrincipalAmount(); }
    public void setAmount(double amount) { setPrincipalAmount(amount); }

    public double getRemainingBalance() { return getRemainingAmount(); }
    public void setRemainingBalance(double remainingBalance) { setRemainingAmount(remainingBalance); }

    public double getMinimumPayment() { return getMonthlyEMI(); }
    public void setMinimumPayment(double minimumPayment) { setMonthlyEMI(minimumPayment); }
}
