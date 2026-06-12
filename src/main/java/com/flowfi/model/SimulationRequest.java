package com.flowfi.model;

public class SimulationRequest {
    private String loanId;
    private double extraPayment;

    public SimulationRequest() {}

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(String loanId) {
        this.loanId = loanId;
    }

    public double getExtraPayment() {
        return extraPayment;
    }

    public void setExtraPayment(double extraPayment) {
        this.extraPayment = extraPayment;
    }
}
