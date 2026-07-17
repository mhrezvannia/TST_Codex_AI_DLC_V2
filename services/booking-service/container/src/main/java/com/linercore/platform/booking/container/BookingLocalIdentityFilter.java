package com.linercore.platform.booking.container;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Set;
import org.springframework.web.filter.OncePerRequestFilter;

final class BookingLocalIdentityFilter extends OncePerRequestFilter {
    private static final long MAX_COMMAND_BODY_BYTES = 32 * 1024;
    private static final Map<String, Set<String>> ALLOWED_ACTORS = Map.of(
            "booking-bff", Set.of("local-user"),
            "seed-loader", Set.of("local-seed"),
            "w1-live-proof", Set.of("local-user"));
    private final byte[] expectedToken;

    BookingLocalIdentityFilter(String expectedToken) {
        if (expectedToken == null || expectedToken.isBlank()) {
            throw new IllegalStateException("BOOKING_SERVICE_TOKEN is required under the local profile");
        }
        this.expectedToken = expectedToken.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/bookings");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String serviceId = request.getHeader("X-LinerCore-Service-Id");
        String actorId = request.getHeader("X-LinerCore-Actor-Id");
        String correlationId = request.getHeader("X-Correlation-Id");
        byte[] supplied = value(request.getHeader("X-LinerCore-Service-Token"));
        Set<String> allowedActors = serviceId == null ? Set.of() : ALLOWED_ACTORS.getOrDefault(serviceId, Set.of());
        if (!allowedActors.contains(actorId)
                || correlationId == null || correlationId.isBlank()
                || !MessageDigest.isEqual(expectedToken, supplied)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"SERVICE_IDENTITY_DENIED\",\"message\":\"Local service identity denied\"}");
            return;
        }
        if ("POST".equals(request.getMethod())) {
            String contentType = request.getContentType();
            if (contentType == null || !contentType.toLowerCase().startsWith("application/json")) {
                reject(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "JSON_REQUIRED",
                        "Content-Type application/json is required");
                return;
            }
            if (request.getContentLengthLong() > MAX_COMMAND_BODY_BYTES) {
                reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "BODY_TOO_LARGE",
                        "Booking command body exceeds 32768 bytes");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }

    private byte[] value(String value) {
        return value == null ? new byte[0] : value.getBytes(StandardCharsets.UTF_8);
    }
}
