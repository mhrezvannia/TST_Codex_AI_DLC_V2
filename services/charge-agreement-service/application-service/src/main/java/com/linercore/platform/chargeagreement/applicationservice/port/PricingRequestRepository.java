package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import java.time.Instant;
import java.util.Optional;

public interface PricingRequestRepository {
    Optional<StoredPricingRequest> findByIdempotencyKey(String idempotencyKey);

    boolean insertClaim(StoredPricingRequest claim);

    boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Instant leaseUntil, Instant now);

    boolean completeOwned(String idempotencyKey, String ownerToken, PricingResult result, String terminalCode,
            Instant completedAt);
}
