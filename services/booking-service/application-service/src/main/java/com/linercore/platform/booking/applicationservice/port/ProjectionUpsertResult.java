package com.linercore.platform.booking.applicationservice.port;

public record ProjectionUpsertResult(
        ConsumedEventDisposition disposition,
        MovementStatusProjection projection) {
}
