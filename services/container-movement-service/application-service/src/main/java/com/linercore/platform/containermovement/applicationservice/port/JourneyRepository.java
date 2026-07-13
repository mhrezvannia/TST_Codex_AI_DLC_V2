package com.linercore.platform.containermovement.applicationservice.port;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import com.linercore.platform.containermovement.domain.model.JourneyId;
import java.util.List;
import java.util.Optional;

public interface JourneyRepository {
    ContainerJourney save(ContainerJourney journey);

    Optional<ContainerJourney> findById(JourneyId id);

    Optional<ContainerJourney> findByBookingId(String bookingId);

    default List<ContainerJourney> findRecent(int limit) {
        return List.of();
    }
}
