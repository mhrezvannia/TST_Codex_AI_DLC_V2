package com.linercore.platform.chargeagreement.container;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authenticates the Charge BFF before binding its asserted actor to a Rate request.
 *
 * <p>The application layer never reads the actor header directly. Controllers consume
 * the request attribute populated here only after the caller credential is verified.
 */
public final class RateServiceIdentityFilter extends OncePerRequestFilter {
    public static final String AUTHENTICATED_ACTOR_ATTRIBUTE =
            "com.linercore.platform.chargeagreement.authenticatedRateActor";

    private static final String SERVICE_ID_HEADER = "X-LinerCore-Service-Id";
    private static final String SERVICE_TOKEN_HEADER = "X-LinerCore-Service-Token";
    private static final String ACTOR_HEADER = "X-Actor-Subject";
    private static final String LEGACY_ACTOR_HEADER = "X-LinerCore-Actor-Id";

    private final String expectedServiceId;
    private final String expectedServiceToken;

    public RateServiceIdentityFilter(String expectedServiceId, String expectedServiceToken) {
        this.expectedServiceId = require(expectedServiceId, "Rate BFF service id");
        this.expectedServiceToken = require(expectedServiceToken, "Rate BFF service token");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !("/api/charge-rates".equals(path) || path.startsWith("/api/charge-rates/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String serviceId = request.getHeader(SERVICE_ID_HEADER);
        String suppliedToken = request.getHeader(SERVICE_TOKEN_HEADER);
        if (!expectedServiceId.equals(serviceId)
                || suppliedToken == null
                || !constantTimeEquals(expectedServiceToken, suppliedToken)) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "RATE_SERVICE_IDENTITY_REQUIRED",
                    "Authenticated Charge BFF service identity is required");
            return;
        }
        if (request.getHeader(LEGACY_ACTOR_HEADER) != null) {
            deny(response, HttpServletResponse.SC_BAD_REQUEST, "RATE_ACTOR_SPOOF_REJECTED",
                    "Actor identity must use the authenticated Rate boundary");
            return;
        }
        String actor = request.getHeader(ACTOR_HEADER);
        if (actor == null || actor.isBlank() || actor.length() > 128 || actor.chars().anyMatch(Character::isISOControl)) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "RATE_ACTOR_REQUIRED",
                    "An authenticated Rate actor is required");
            return;
        }
        request.setAttribute(AUTHENTICATED_ACTOR_ATTRIBUTE, actor);
        filterChain.doFilter(request, response);
    }

    private static boolean constantTimeEquals(String expected, String supplied) {
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                supplied.getBytes(StandardCharsets.UTF_8));
    }

    private static String require(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value;
    }

    private static void deny(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message
                + "\",\"fields\":[]}");
    }
}
