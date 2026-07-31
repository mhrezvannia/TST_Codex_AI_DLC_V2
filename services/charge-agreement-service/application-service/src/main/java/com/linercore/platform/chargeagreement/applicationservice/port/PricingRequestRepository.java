package com.linercore.platform.chargeagreement.applicationservice.port;

import java.time.Duration;
import java.util.Optional;

public interface PricingRequestRepository {
    Optional<StoredPricingReceipt> findReceiptByIdempotencyKey(String idempotencyKey);

    boolean insertClaim(PricingClaim claim, Duration leaseDuration);

    boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Duration leaseDuration);

    CompletionResult completeOwned(OwnedPricingCompletion completion);

    record CompletionResult(boolean completed, PricingTerminalReceipt receipt) {
        public CompletionResult {
            if (completed != (receipt != null)) {
                throw new IllegalArgumentException("completed result must contain exactly one receipt");
            }
        }

        public static CompletionResult staleOwner() {
            return new CompletionResult(false, null);
        }

        public static CompletionResult completed(PricingTerminalReceipt receipt) {
            return new CompletionResult(true, receipt);
        }
    }
}
