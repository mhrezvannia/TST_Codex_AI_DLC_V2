package com.linercore.platform.chargeagreement.container;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.web.filter.OncePerRequestFilter;

public final class PricingServiceIdentityFilter extends OncePerRequestFilter {
    public static final String VERIFIED_SERVICE_ATTRIBUTE =
            "com.linercore.platform.chargeagreement.verifiedPricingService";

    private static final String SERVICE_ID = "X-LinerCore-Service-Id";
    private static final String SERVICE_TOKEN = "X-LinerCore-Service-Token";
    private static final String LEGACY_ACTOR = "X-LinerCore-Actor-Id";
    private static final String SUBJECT_ASSERTION = "X-LinerCore-Subject-Assertion";
    private static final String CORRELATION = "X-Correlation-Id";

    private final String expectedServiceId;
    private final String expectedServiceToken;

    public PricingServiceIdentityFilter(String expectedServiceId, String expectedServiceToken) {
        this.expectedServiceId = required(expectedServiceId, "pricing service ID");
        this.expectedServiceToken = required(expectedServiceToken, "pricing service token");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"/pricing-requests".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (request.getHeader(LEGACY_ACTOR) != null || request.getHeader(SUBJECT_ASSERTION) != null) {
            deny(response, HttpServletResponse.SC_BAD_REQUEST, "PRICING_IDENTITY_SPOOF_REJECTED",
                    "Pricing identity must use the trusted service boundary");
            return;
        }
        String serviceId = request.getHeader(SERVICE_ID);
        String serviceToken = request.getHeader(SERVICE_TOKEN);
        if (!expectedServiceId.equals(serviceId)
                || serviceToken == null
                || !MessageDigest.isEqual(
                        expectedServiceToken.getBytes(StandardCharsets.UTF_8),
                        serviceToken.getBytes(StandardCharsets.UTF_8))) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "PRICING_SERVICE_IDENTITY_REQUIRED",
                    "Trusted pricing service identity is required");
            return;
        }
        String correlationId = request.getHeader(CORRELATION);
        if (!safeHeader(correlationId, 128)) {
            deny(response, HttpServletResponse.SC_BAD_REQUEST, "PRICING_CORRELATION_INVALID",
                    "A safe correlation ID is required");
            return;
        }
        request.setAttribute(VERIFIED_SERVICE_ATTRIBUTE, serviceId);
        filterChain.doFilter(request, response);
    }

    private static boolean safeHeader(String value, int maxLength) {
        return value != null && !value.isBlank() && value.length() <= maxLength
                && value.chars().noneMatch(Character::isISOControl);
    }

    private static String required(String value, String field) {
        if (!safeHeader(value, 256)) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value;
    }

    private static void deny(HttpServletResponse response, int status, String code, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message
                + "\",\"correlationId\":\"rejected\"}");
    }
}
