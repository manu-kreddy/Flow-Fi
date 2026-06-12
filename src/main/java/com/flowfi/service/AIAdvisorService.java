package com.flowfi.service;

import com.flowfi.model.AdvisorResponse;
import com.flowfi.model.ChatResponse;
import com.flowfi.model.Debt;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAdvisorService {

    @Autowired
    private DebtService debtService;

    @Value("${openai.api.key:}")
    private String openaiApiKeyProp;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    private final ObjectMapper mapper = new ObjectMapper();

    public AdvisorResponse getAdvisor(String userId) {
        try {
            return callOpenAiAdvisor(userId);
        } catch (Exception e) {
            // fallback to local heuristic
            AdvisorResponse fallback = heuristicAdvisor(userId);
            fallback.setRaw("fallback: " + e.getMessage());
            return fallback;
        }
    }

    public ChatResponse chat(String userId, String message) {
        try {
            String apiKey = resolveApiKey();
            if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("OpenAI API key not configured");

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are a helpful financial advisor. The user has debts and you should answer clearly and helpfully."));

            // include debts context
            List<Debt> debts = debtService.getDebts(userId);
            String debtContext = debts.stream().map(d -> String.format("%s: remaining=%.2f, rate=%.2f%%, emi=%.2f", d.getLoanName(), d.getRemainingAmount(), d.getInterestRate(), d.getMonthlyEMI())).collect(Collectors.joining("\n"));
            messages.add(Map.of("role", "user", "content", "Here are the user's debts:\n" + debtContext + "\nUser asks: " + message));

            String resp = callChatCompletion(apiKey, messages);
            return new ChatResponse("assistant", resp);
        } catch (Exception e) {
            return new ChatResponse("assistant", "Sorry, the advisor service is temporarily unavailable. " + e.getMessage());
        }
    }

    private AdvisorResponse callOpenAiAdvisor(String userId) throws IOException, InterruptedException {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("OpenAI API key not configured");

        List<Debt> debts = debtService.getDebts(userId);

        StringBuilder userContent = new StringBuilder();
        userContent.append("Please analyze the following debts and respond with a JSON object containing the keys: summary (string), riskLevel (Low|Medium|High), suggestions (array of strings), repaymentAdvice (array of strings). Respond with only valid JSON.\n\nDebts:\n");
        for (Debt d : debts) {
            userContent.append(String.format("- %s | remaining: %.2f | rate: %.2f | emi: %.2f\n", d.getLoanName(), d.getRemainingAmount(), d.getInterestRate(), d.getMonthlyEMI()));
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are a crisp, concise financial advisor that outputs machine-readable JSON as requested."));
        messages.add(Map.of("role", "user", "content", userContent.toString()));

        String content = callChatCompletion(apiKey, messages);

        // try to extract JSON object from response
        String json = extractJson(content);
        AdvisorResponse resp;
        try {
            resp = mapper.readValue(json, AdvisorResponse.class);
            resp.setRaw(content);
            return resp;
        } catch (Exception e) {
            // parsing failed - return heuristic with raw attached
            AdvisorResponse fallback = heuristicAdvisor(userId);
            fallback.setRaw(content);
            return fallback;
        }
    }

    private String callChatCompletion(String apiKey, List<Map<String, String>> messages) throws IOException, InterruptedException {
        Map<String, Object> body = new HashMap<>();
        body.put("model", openaiModel);
        body.put("messages", messages);

        String payload = mapper.writeValueAsString(body);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) throw new IOException("OpenAI API error: " + resp.statusCode() + " " + resp.body());

        JsonNode node = mapper.readTree(resp.body());
        if (node.has("choices") && node.get("choices").isArray() && node.get("choices").size() > 0) {
            JsonNode msg = node.get("choices").get(0).get("message");
            if (msg != null && msg.has("content")) return msg.get("content").asText();
        }
        throw new IOException("Unexpected OpenAI response: " + resp.body());
    }

    private String extractJson(String text) {
        if (text == null) return "{}";
        int first = text.indexOf('{');
        int last = text.lastIndexOf('}');
        if (first >= 0 && last > first) return text.substring(first, last + 1);
        return "{}";
    }

    private String resolveApiKey() {
        if (openaiApiKeyProp != null && !openaiApiKeyProp.isBlank()) return openaiApiKeyProp;
        String env = System.getenv("OPENAI_API_KEY");
        if (env != null && !env.isBlank()) return env;
        return null;
    }

    private AdvisorResponse heuristicAdvisor(String userId) {
        List<Debt> debts = debtService.getDebts(userId);
        double totalDebt = debts.stream().mapToDouble(d -> d.getRemainingAmount()).sum();
        double totalEMI = debts.stream().mapToDouble(d -> d.getMonthlyEMI()).sum();
        int count = debts.size();

        boolean hasHighInterest = debts.stream().anyMatch(d -> d.getInterestRate() > 15.0);

        AdvisorResponse r = new AdvisorResponse();
        r.setSummary(String.format("You have %d loans totalling ₹%.0f. Your monthly EMIs total ₹%.0f.", count, totalDebt, totalEMI));
        r.setRiskLevel(hasHighInterest || totalDebt > 100000 ? "High" : (totalDebt > 25000 ? "Medium" : "Low"));

        List<String> sugg = new ArrayList<>();
        if (hasHighInterest) {
            List<String> high = debts.stream().filter(d -> d.getInterestRate() > 15.0).map(Debt::getLoanName).collect(Collectors.toList());
            sugg.add("Prioritize paying high-interest accounts first: " + String.join(", ", high));
        }
        sugg.add("Consider consolidating low-interest loans if it reduces overall payments and fees.");
        sugg.add("Keep an emergency buffer before accelerating payments.");
        r.setSuggestions(sugg);

        List<String> adv = new ArrayList<>();
        adv.add("Apply extra monthly payments to the highest-interest loan (Avalanche) to save interest.");
        adv.add("If you prefer quick wins, consider the Snowball method (pay smallest balances first) to build momentum.");
        r.setRepaymentAdvice(adv);

        return r;
    }
}
