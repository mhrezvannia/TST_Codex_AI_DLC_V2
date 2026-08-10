package com.linercore.platform.chargeagreement.applicationservice.rate;

import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public final class RateViews {
    private RateViews() {
    }

    public record Detail(
            Rate rate,
            List<Version> versions,
            List<RateActivity> activities,
            Actions actions,
            LocalDate evaluatedAsOf) {
    }

    public record Version(RateVersion version, RatePresentationState presentationState) {
    }

    public record Actions(boolean canEdit, boolean canApprove, boolean canCreateSuccessor) {
    }

    public record ListItem(
            Rate rate,
            Version latestVersion,
            Version selectedSummaryVersion,
            Version effectiveApprovedVersion,
            boolean hasDraft,
            int versionCount,
            Actions actions,
            LocalDate evaluatedAsOf) {
    }

    public record Page(
            List<ListItem> items,
            int page,
            int size,
            long total,
            boolean hasMore,
            boolean canCreate,
            LocalDate evaluatedAsOf) {
    }

    static Version version(RateVersion value, LocalDate asOf) {
        return value == null ? null : new Version(value, value.presentationState(asOf));
    }

    static RateVersion selectSummary(Rate rate, RatePresentationState filter, LocalDate asOf) {
        List<RateVersion> versions = rate.versions();
        if (filter == RatePresentationState.DRAFT) {
            return rate.draft();
        }
        if (filter == RatePresentationState.SCHEDULED) {
            return versions.stream()
                    .filter(value -> value.presentationState(asOf) == RatePresentationState.SCHEDULED)
                    .min(Comparator.comparing(RateVersion::effectiveFrom)
                            .thenComparing(Comparator.comparingLong(RateVersion::versionNo).reversed()))
                    .orElse(null);
        }
        if (filter == RatePresentationState.EFFECTIVE) {
            return effective(versions, asOf);
        }
        if (filter == RatePresentationState.EXPIRED) {
            return versions.stream()
                    .filter(value -> value.presentationState(asOf) == RatePresentationState.EXPIRED)
                    .max(Comparator.comparing(RateVersion::effectiveTo)
                            .thenComparingLong(RateVersion::versionNo))
                    .orElse(null);
        }
        RateVersion effective = effective(versions, asOf);
        if (effective != null) {
            return effective;
        }
        if (rate.draft() != null) {
            return rate.draft();
        }
        RateVersion scheduled = selectSummary(rate, RatePresentationState.SCHEDULED, asOf);
        return scheduled != null ? scheduled : versions.stream()
                .filter(value -> value.presentationState(asOf) == RatePresentationState.EXPIRED)
                .max(Comparator.comparing(RateVersion::effectiveTo).thenComparingLong(RateVersion::versionNo))
                .orElse(rate.latestVersion());
    }

    static RateVersion effective(List<RateVersion> versions, LocalDate asOf) {
        return versions.stream()
                .filter(value -> value.presentationState(asOf) == RatePresentationState.EFFECTIVE)
                .max(Comparator.comparingLong(RateVersion::versionNo))
                .orElse(null);
    }
}
