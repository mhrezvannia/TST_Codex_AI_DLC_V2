package com.linercore.platform.referencedata.dataaccess.inmemory;

import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import java.util.UUID;

public class UuidIdGenerator implements IdGenerator {
    public String nextId() {
        return UUID.randomUUID().toString();
    }
}
