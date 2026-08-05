package com.linercore.platform.chargeagreement.container.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import org.springframework.web.filter.OncePerRequestFilter;

public final class ChargeSubjectAssertionFilter extends OncePerRequestFilter {
    public static final String VERIFIED_SUBJECT_ATTRIBUTE =
            "com.linercore.platform.chargeagreement.verifiedW2AgreementSubject";
    private static final String HEADER = "X-LinerCore-Subject-Assertion";
    private static final String CORRELATION = "X-Correlation-Id";
    private static final String VENDOR_MEDIA =
            "application/vnd.linercore.charge-agreement-v2+json";

    private final ChargeSubjectAssertionVerifier verifier;

    public ChargeSubjectAssertionFilter(ChargeSubjectAssertionVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("/api/manual-pricing-cases".equals(path)
                || path.startsWith("/api/manual-pricing-cases/")) {
            return false;
        }
        if (!("/api/charge-agreements".equals(path) || path.startsWith("/api/charge-agreements/"))) {
            return true;
        }
        String accept = request.getHeader("Accept");
        String contentType = request.getContentType();
        return !VENDOR_MEDIA.equals(accept) && !VENDOR_MEDIA.equals(contentType);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        List<String> assertions = Collections.list(request.getHeaders(HEADER));
        if (assertions.size() != 1 || assertions.get(0).contains(",")) {
            deny(response, ChargeSubjectAssertionFailure.INVALID_SUBJECT_ASSERTION);
            return;
        }
        ChargeSubjectAssertionResult result = verifier.verify(
                assertions.get(0),
                request.getMethod(),
                request.getRequestURI(),
                request.getHeader(CORRELATION));
        if (!result.valid()) {
            deny(response, result.failure());
            return;
        }
        request.setAttribute(VERIFIED_SUBJECT_ATTRIBUTE, result.claims().subject());
        filterChain.doFilter(request, response);
    }

    private static void deny(HttpServletResponse response, ChargeSubjectAssertionFailure failure) throws IOException {
        response.setStatus(failure.status());
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"" + failure.code()
                + "\",\"message\":\"Subject assertion was rejected\",\"fields\":[]}");
    }
}
