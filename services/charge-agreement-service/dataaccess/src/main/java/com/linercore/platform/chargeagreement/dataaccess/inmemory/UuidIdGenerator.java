package com.linercore.platform.chargeagreement.dataaccess.inmemory;

import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import java.util.UUID;

public class UuidIdGenerator implements IdGenerator {
    public String nextId() {
        return UUID.randomUUID().toString();
    }
}
