package com.flowfi.service;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class StrategyServiceTest {

    @Autowired
    private StrategyService strategyService;

    @Test
    public void computeStrategies_returnsResults() {
        Map<String, Object> res = strategyService.computeStrategies("dev-user", 500);
        assertNotNull(res);
        assertTrue(res.containsKey("recommendedStrategy"));
        assertTrue(res.containsKey("snowball"));
        assertTrue(res.containsKey("avalanche"));
    }

    @Test
    public void negativeExtraPayment_throws() {
        assertThrows(IllegalArgumentException.class, () -> strategyService.computeStrategies("dev-user", -10));
    }
}
