package com.flowfi.model;

public class SimulationResult {
    private int currentMonths;
    private int newMonths;
    private double interestSaved;
    private double currentTotalInterest;
    private double newTotalInterest;

    public SimulationResult() {}

    public SimulationResult(int currentMonths, int newMonths, double interestSaved, double currentTotalInterest, double newTotalInterest) {
        this.currentMonths = currentMonths;
        this.newMonths = newMonths;
        this.interestSaved = interestSaved;
        this.currentTotalInterest = currentTotalInterest;
        this.newTotalInterest = newTotalInterest;
    }

    public int getCurrentMonths() { return currentMonths; }
    public void setCurrentMonths(int currentMonths) { this.currentMonths = currentMonths; }

    public int getNewMonths() { return newMonths; }
    public void setNewMonths(int newMonths) { this.newMonths = newMonths; }

    public double getInterestSaved() { return interestSaved; }
    public void setInterestSaved(double interestSaved) { this.interestSaved = interestSaved; }

    public double getCurrentTotalInterest() { return currentTotalInterest; }
    public void setCurrentTotalInterest(double currentTotalInterest) { this.currentTotalInterest = currentTotalInterest; }

    public double getNewTotalInterest() { return newTotalInterest; }
    public void setNewTotalInterest(double newTotalInterest) { this.newTotalInterest = newTotalInterest; }
}
