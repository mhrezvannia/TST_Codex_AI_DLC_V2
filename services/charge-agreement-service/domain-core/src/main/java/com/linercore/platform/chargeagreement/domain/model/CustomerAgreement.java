package com.linercore.platform.chargeagreement.domain.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record CustomerAgreement(
        AgreementId id,
        AgreementNumber agreementNumber,
        ReferenceId customerId,
        ReferenceId tradeLaneId,
        ReferenceId commodityId,
        ValidityWindow validity,
        AgreementStatus status,
        long version,
        List<ChargeTerm> terms,
        List<ActivityEntry> activity) {
    public CustomerAgreement {
        if (id == null) {
            throw new IllegalArgumentException("agreement id is required");
        }
        if (agreementNumber == null) {
            throw new IllegalArgumentException("agreement number is required");
        }
        if (customerId == null) {
            throw new IllegalArgumentException("customer id is required");
        }
        if (tradeLaneId == null) {
            throw new IllegalArgumentException("trade lane id is required");
        }
        if (commodityId == null) {
            throw new IllegalArgumentException("commodity id is required");
        }
        if (validity == null) {
            throw new IllegalArgumentException("agreement validity is required");
        }
        if (status == null) {
            throw new IllegalArgumentException("agreement status is required");
        }
        if (version < 1) {
            throw new IllegalArgumentException("agreement version must be positive");
        }
        terms = terms == null ? List.of() : List.copyOf(terms);
        activity = activity == null ? List.of() : List.copyOf(activity);
        validateTermsInsideAgreement(validity, terms);
    }

    public static CustomerAgreement create(
            AgreementId id,
            AgreementNumber agreementNumber,
            ReferenceId customerId,
            ReferenceId tradeLaneId,
            ReferenceId commodityId,
            ValidityWindow validity,
            String actor,
            Instant now,
            String reason) {
        return new CustomerAgreement(id, agreementNumber, customerId, tradeLaneId, commodityId, validity,
                AgreementStatus.DRAFT, 1, List.of(), List.of(activity("CREATED", actor, now, reason)));
    }

    public CustomerAgreement updateHeader(
            AgreementNumber newAgreementNumber,
            ReferenceId newCustomerId,
            ReferenceId newTradeLaneId,
            ReferenceId newCommodityId,
            ValidityWindow newValidity,
            String actor,
            Instant now,
            String reason) {
        requireDraft("update agreement");
        return new CustomerAgreement(id, newAgreementNumber, newCustomerId, newTradeLaneId, newCommodityId,
                newValidity, status, version + 1, terms, withActivity("UPDATED_HEADER", actor, now, reason));
    }

    public CustomerAgreement replaceTerms(List<ChargeTerm> newTerms, String actor, Instant now, String reason) {
        requireDraft("update charge terms");
        return new CustomerAgreement(id, agreementNumber, customerId, tradeLaneId, commodityId, validity,
                status, version + 1, newTerms, withActivity("REPLACED_TERMS", actor, now, reason));
    }

    public CustomerAgreement approve(String actor, Instant now, String reason) {
        requireDraft("approve agreement");
        if (terms.isEmpty()) {
            throw new IllegalStateException("approval requires at least one charge term");
        }
        return withStatus(AgreementStatus.APPROVED, "APPROVED", actor, now, reason);
    }

    public CustomerAgreement suspend(String actor, Instant now, String reason) {
        requireStatus(AgreementStatus.APPROVED, "suspend agreement");
        return withStatus(AgreementStatus.SUSPENDED, "SUSPENDED", actor, now, reason);
    }

    public CustomerAgreement expire(String actor, Instant now, String reason) {
        requireStatus(AgreementStatus.APPROVED, "expire agreement");
        return withStatus(AgreementStatus.EXPIRED, "EXPIRED", actor, now, reason);
    }

    public boolean isActiveOn(LocalDate date) {
        return status == AgreementStatus.APPROVED && validity.contains(date);
    }

    private CustomerAgreement withStatus(AgreementStatus newStatus, String action, String actor, Instant now, String reason) {
        return new CustomerAgreement(id, agreementNumber, customerId, tradeLaneId, commodityId, validity,
                newStatus, version + 1, terms, withActivity(action, actor, now, reason));
    }

    private void requireDraft(String action) {
        requireStatus(AgreementStatus.DRAFT, action);
    }

    private void requireStatus(AgreementStatus expected, String action) {
        if (status != expected) {
            throw new IllegalStateException(action + " requires " + expected + " status");
        }
    }

    private List<ActivityEntry> withActivity(String action, String actor, Instant now, String reason) {
        ArrayList<ActivityEntry> entries = new ArrayList<>(activity);
        entries.add(activity(action, actor, now, reason));
        return entries;
    }

    private static ActivityEntry activity(String action, String actor, Instant now, String reason) {
        return new ActivityEntry(action, actor, now, reason);
    }

    private static void validateTermsInsideAgreement(ValidityWindow agreementValidity, List<ChargeTerm> terms) {
        for (ChargeTerm term : terms) {
            if (!agreementValidity.contains(term.validity())) {
                throw new IllegalArgumentException("charge term validity must fit inside agreement validity");
            }
        }
    }
}
