package com.linercore.platform.identity.dataaccess.inmemory;

import com.linercore.platform.identity.applicationservice.port.IdGenerator;
import java.util.UUID;

public class UuidIdGenerator implements IdGenerator {
    public String nextId() {
        return UUID.randomUUID().toString();
    }
}
