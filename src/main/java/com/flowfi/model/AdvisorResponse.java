package com.flowfi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AdvisorResponse {
    private String summary;
    private String riskLevel;
    private List<String> suggestions;
    private List<String> repaymentAdvice;
    private String raw;

    public AdvisorResponse() {}

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public List<String> getRepaymentAdvice() { return repaymentAdvice; }
    public void setRepaymentAdvice(List<String> repaymentAdvice) { this.repaymentAdvice = repaymentAdvice; }

    public String getRaw() { return raw; }
    public void setRaw(String raw) { this.raw = raw; }
}
