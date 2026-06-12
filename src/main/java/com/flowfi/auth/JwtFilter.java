package com.flowfi.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Try to extract a user id from a Bearer JWT (payload decode only, no signature verification)
        String auth = request.getHeader("Authorization");
        String userId = "dev-user";
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
                    String payload = new String(decoded, StandardCharsets.UTF_8);
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode node = mapper.readTree(payload);
                    if (node.has("sub")) userId = node.get("sub").asText();
                    else if (node.has("userId")) userId = node.get("userId").asText();
                }
            } catch (Exception ignored) {
                // fallback to dev-user
            }
        }

        var authentication = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
