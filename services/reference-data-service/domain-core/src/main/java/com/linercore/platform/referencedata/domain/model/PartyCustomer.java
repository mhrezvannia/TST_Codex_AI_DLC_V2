package com.linercore.platform.referencedata.domain.model;

import java.util.Set;

public record PartyCustomer(ReferenceRecord record, String legalName, Set<String> partyRoles, Classification classification) {
}
