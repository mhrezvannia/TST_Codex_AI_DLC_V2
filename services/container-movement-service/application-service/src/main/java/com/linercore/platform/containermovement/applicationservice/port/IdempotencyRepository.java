package com.linercore.platform.containermovement.applicationservice.port;

import com.linercore.platform.containermovement.domain.model.JourneyId;
import java.util.Optional;

public interface IdempotencyRepository {
    Optional<JourneyId> findJourneyId(String idempotencyKey);

    Optional<String> findMovementEventId(String idempotencyKey);

    void rememberJourney(String idempotencyKey, JourneyId journeyId);

    void rememberMovement(String idempotencyKey, String eventId);
}
