package com.flowfi.model;

public class Dashboard {
    private double totalDebt;
    private double totalEMI;
    private int loanCount;
    private double progressPercentage;

    public Dashboard() {}

    public Dashboard(double totalDebt, double totalEMI, int loanCount, double progressPercentage) {
        this.totalDebt = totalDebt;
        this.totalEMI = totalEMI;
        this.loanCount = loanCount;
        this.progressPercentage = progressPercentage;
    }

    public double getTotalDebt() {
        return totalDebt;
    }

    public void setTotalDebt(double totalDebt) {
        this.totalDebt = totalDebt;
    }

    public double getTotalEMI() {
        return totalEMI;
    }

    public void setTotalEMI(double totalEMI) {
        this.totalEMI = totalEMI;
    }

    public int getLoanCount() {
        return loanCount;
    }

    public void setLoanCount(int loanCount) {
        this.loanCount = loanCount;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
