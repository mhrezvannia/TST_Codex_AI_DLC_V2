package com.linercore.platform.referencedata.container;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.web.filter.OncePerRequestFilter;

public final class ReferenceDataLocalIdentityFilter extends OncePerRequestFilter {
    private final Map<String, String> clientTokens;

    public ReferenceDataLocalIdentityFilter(Map<String, String> clientTokens) {
        this.clientTokens = Map.copyOf(clientTokens);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/reference-sets");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String clientId = request.getHeader("X-LinerCore-Service-Id");
        String suppliedToken = request.getHeader("X-LinerCore-Local-Token");
        String expectedToken = clientId == null ? null : clientTokens.get(clientId);
        if (expectedToken == null || suppliedToken == null || !constantTimeEquals(expectedToken, suppliedToken)) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "REFERENCE_SERVICE_IDENTITY_REQUIRED");
            return;
        }
        if (("booking-service".equals(clientId) || "container-movement-service".equals(clientId))
                && !"GET".equals(request.getMethod())) {
            deny(response, HttpServletResponse.SC_FORBIDDEN, "REFERENCE_READ_ONLY");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static boolean constantTimeEquals(String expected, String supplied) {
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                supplied.getBytes(StandardCharsets.UTF_8));
    }

    private static void deny(HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"Reference Data access denied\"}");
    }
}
