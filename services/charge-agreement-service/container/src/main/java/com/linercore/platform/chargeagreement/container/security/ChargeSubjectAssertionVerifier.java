package com.linercore.platform.chargeagreement.container.security;

import static com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFailure.INVALID_SUBJECT_ASSERTION;
import static com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFailure.SUBJECT_ASSERTION_CAPACITY_EXHAUSTED;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class ChargeSubjectAssertionVerifier {
    private static final Pattern KID = Pattern.compile("^[A-Za-z0-9_-]{1,32}$");
    private static final Pattern BASE64URL = Pattern.compile("^[A-Za-z0-9_-]+$");
    private static final Pattern CORRELATION = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$");
    private static final List<String> FIELD_ORDER =
            List.of("iss", "kid", "sub", "mth", "pth", "cid", "iat", "exp", "nonce");

    private final String expectedKid;
    private final byte[] secret;
    private final ChargeSubjectAssertionReplayCache replayCache;
    private final Clock clock;

    public ChargeSubjectAssertionVerifier(
            String expectedKid,
            byte[] secret,
            ChargeSubjectAssertionReplayCache replayCache,
            Clock clock) {
        if (!KID.matcher(expectedKid).matches() || secret == null || secret.length < 16) {
            throw new IllegalArgumentException("Assertion verifier configuration is invalid");
        }
        this.expectedKid = expectedKid;
        this.secret = secret.clone();
        this.replayCache = replayCache;
        this.clock = clock;
    }

    public ChargeSubjectAssertionResult verify(
            String compact,
            String requestMethod,
            String requestPath,
            String correlationId) {
        try {
            if (compact == null || compact.isBlank() || compact.indexOf(',') >= 0 || compact.length() > 8192) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            String[] parts = compact.split("\\.", -1);
            if (parts.length != 4 || !"v1".equals(parts[0]) || !expectedKid.equals(parts[1])
                    || !KID.matcher(parts[1]).matches()) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            byte[] payloadBytes = strictBase64Url(parts[2]);
            byte[] suppliedSignature = strictBase64Url(parts[3]);
            String signingInput = parts[0] + "." + parts[1] + "." + parts[2];
            byte[] expectedSignature = hmac(signingInput.getBytes(StandardCharsets.US_ASCII));
            if (suppliedSignature.length != expectedSignature.length
                    || !MessageDigest.isEqual(suppliedSignature, expectedSignature)) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            List<Field> fields = parsePayload(payloadBytes);
            if (!FIELD_ORDER.equals(fields.stream().map(Field::name).toList())) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            String issuer = fields.get(0).value();
            String kid = fields.get(1).value();
            String subject = fields.get(2).value();
            String method = fields.get(3).value();
            String path = fields.get(4).value();
            String correlation = fields.get(5).value();
            long issuedAt = canonicalEpoch(fields.get(6).value());
            long expiresAt = canonicalEpoch(fields.get(7).value());
            String nonce = fields.get(8).value();
            if (!"charge-agreements-bff".equals(issuer)
                    || !expectedKid.equals(kid)
                    || subject.isBlank() || subject.length() > 128
                    || !requestMethod.equals(method)
                    || !requestPath.equals(path)
                    || !correlationId.equals(correlation)
                    || !CORRELATION.matcher(correlation).matches()
                    || expiresAt != issuedAt + 30
                    || !isCanonicalNonce(nonce)) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            long now = clock.instant().getEpochSecond();
            if (issuedAt > now + 5 || expiresAt < now - 5) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            ChargeSubjectAssertionReplayCache.ClaimResult claim =
                    replayCache.claim(kid, nonce, expiresAt, now);
            if (claim == ChargeSubjectAssertionReplayCache.ClaimResult.DUPLICATE) {
                return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
            }
            if (claim == ChargeSubjectAssertionReplayCache.ClaimResult.CAPACITY_EXHAUSTED) {
                return ChargeSubjectAssertionResult.invalid(SUBJECT_ASSERTION_CAPACITY_EXHAUSTED);
            }
            return ChargeSubjectAssertionResult.valid(new ChargeSubjectAssertionResult.Claims(
                    issuer, kid, subject, method, path, correlation, issuedAt, expiresAt, nonce));
        } catch (RuntimeException | GeneralSecurityException exception) {
            return ChargeSubjectAssertionResult.invalid(INVALID_SUBJECT_ASSERTION);
        }
    }

    private byte[] strictBase64Url(String value) {
        if (!BASE64URL.matcher(value).matches() || value.indexOf('=') >= 0) {
            throw new IllegalArgumentException("Invalid base64url");
        }
        byte[] decoded = Base64.getUrlDecoder().decode(value);
        if (!Base64.getUrlEncoder().withoutPadding().encodeToString(decoded).equals(value)) {
            throw new IllegalArgumentException("Non-canonical base64url");
        }
        return decoded;
    }

    private List<Field> parsePayload(byte[] payload) {
        byte[] prefix = "lc-bff-assertion:v1\n".getBytes(StandardCharsets.US_ASCII);
        if (!startsWith(payload, prefix)) throw new IllegalArgumentException("Invalid assertion prefix");
        int offset = prefix.length;
        List<Field> fields = new ArrayList<>(FIELD_ORDER.size());
        for (String expectedName : FIELD_ORDER) {
            int nameEnd = indexOf(payload, (byte) ':', offset);
            String name = ascii(payload, offset, nameEnd);
            if (!expectedName.equals(name)) throw new IllegalArgumentException("Invalid assertion field");
            int lengthEnd = indexOf(payload, (byte) ':', nameEnd + 1);
            String lengthValue = ascii(payload, nameEnd + 1, lengthEnd);
            if (!lengthValue.matches("0|[1-9][0-9]*")) throw new IllegalArgumentException("Invalid field length");
            int length = Integer.parseInt(lengthValue);
            int valueStart = lengthEnd + 1;
            int valueEnd = Math.addExact(valueStart, length);
            if (valueEnd >= payload.length || payload[valueEnd] != '\n') {
                throw new IllegalArgumentException("Invalid field framing");
            }
            String value = utf8(payload, valueStart, valueEnd);
            if (value.isEmpty() || value.chars().anyMatch(ch -> Character.isISOControl(ch))) {
                throw new IllegalArgumentException("Invalid field value");
            }
            fields.add(new Field(name, value));
            offset = valueEnd + 1;
        }
        if (offset != payload.length) throw new IllegalArgumentException("Trailing assertion bytes");
        return fields;
    }

    private byte[] hmac(byte[] value) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(value);
    }

    private static long canonicalEpoch(String value) {
        if (!value.matches("0|[1-9][0-9]*")) throw new IllegalArgumentException("Invalid epoch");
        return Long.parseLong(value);
    }

    private boolean isCanonicalNonce(String value) {
        byte[] nonce = strictBase64Url(value);
        return nonce.length == 16;
    }

    private static boolean startsWith(byte[] value, byte[] prefix) {
        if (value.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) if (value[i] != prefix[i]) return false;
        return true;
    }

    private static int indexOf(byte[] value, byte needle, int start) {
        for (int i = start; i < value.length; i++) if (value[i] == needle) return i;
        throw new IllegalArgumentException("Delimiter missing");
    }

    private static String ascii(byte[] value, int start, int end) {
        for (int i = start; i < end; i++) if ((value[i] & 0x80) != 0) throw new IllegalArgumentException("Non-ASCII framing");
        return new String(value, start, end - start, StandardCharsets.US_ASCII);
    }

    private static String utf8(byte[] value, int start, int end) {
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(value, start, end - start)).toString();
        } catch (CharacterCodingException exception) {
            throw new IllegalArgumentException("Invalid UTF-8", exception);
        }
    }

    private record Field(String name, String value) {
    }
}
