package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.LegacyPricingOutcome;
import java.time.Instant;
import java.util.Optional;

/**
 * Compatibility-only persistence seam for the retired mutable-agreement pricing path.
 * U04 provider code must depend on {@link PricingRequestRepository}.
 */
public interface LegacyPricingRequestRepository {
    Optional<StoredLegacyPricingRequest> findByIdempotencyKey(String idempotencyKey);

    boolean insertClaim(StoredLegacyPricingRequest claim);

    boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Instant leaseUntil, Instant now);

    boolean completeOwned(
            String idempotencyKey,
            String ownerToken,
            LegacyPricingOutcome outcome,
            String terminalCode,
            Instant completedAt);
}
