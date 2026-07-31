package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.applicationservice.pricing.PricingCommandResult;
import com.linercore.platform.booking.domain.model.BookingId;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

public interface PricingOperationReceiptPort {
    ClaimResult claim(ClaimCommand command);

    Optional<Receipt> find(String receiptKey);

    CompletionResult complete(CompletionCommand command);

    enum ClaimDisposition {
        CLAIMED,
        REPLAY,
        IN_PROGRESS,
        CONFLICT
    }

    enum CompletionDisposition {
        COMPLETED,
        REPLAY,
        STALE_OWNER,
        BOOKING_CHANGED
    }

    record ClaimCommand(
            String receiptKey,
            BookingId bookingId,
            String providerKey,
            String inputHash,
            String ownerToken,
            Duration lease,
            int expectedRevision,
            int expectedAmendmentSeq,
            String correlationId) {
        public ClaimCommand {
            if (receiptKey == null || !receiptKey.equals("P|" + providerKey)) {
                throw new IllegalArgumentException("receipt key must be P|<provider key>");
            }
            if (inputHash == null || !inputHash.matches("[0-9a-f]{64}")) {
                throw new IllegalArgumentException("input hash must be lowercase SHA-256");
            }
            if (ownerToken == null || ownerToken.isBlank() || lease == null || lease.isNegative() || lease.isZero()) {
                throw new IllegalArgumentException("owner token and positive lease are required");
            }
        }
    }

    record ClaimResult(ClaimDisposition disposition, Receipt receipt) {
        public ClaimResult {
            if (disposition == null || receipt == null) {
                throw new IllegalArgumentException("claim disposition and receipt are required");
            }
        }
    }

    record Receipt(
            String receiptKey,
            BookingId bookingId,
            String providerKey,
            String inputHash,
            String state,
            String ownerToken,
            Instant leaseExpiresAt,
            long fenceToken,
            int attemptCount,
            Instant nextAttemptAt,
            PricingCommandResult response,
            String correlationId) {}

    record CompletionCommand(
            String receiptKey,
            BookingId bookingId,
            String ownerToken,
            long fenceToken,
            String actorSubjectId,
            int expectedRevision,
            int expectedAmendmentSeq,
            String expectedInputHash,
            PricingCommandResult response) {
        public CompletionCommand {
            if (actorSubjectId == null || actorSubjectId.isBlank()) {
                throw new IllegalArgumentException("actor subject id is required");
            }
        }
    }

    record CompletionResult(CompletionDisposition disposition, PricingCommandResult response) {
        public CompletionResult {
            if (disposition == null) {
                throw new IllegalArgumentException("completion disposition is required");
            }
        }
    }
}
