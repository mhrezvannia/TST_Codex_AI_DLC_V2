package com.linercore.platform.referencedata.domain.model;

import java.util.Set;

public record Region(ReferenceRecord record, Set<ReferenceId> assignedLocationIds) {
}
