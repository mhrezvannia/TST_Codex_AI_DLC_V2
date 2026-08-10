package com.linercore.platform.chargeagreement.domain.agreement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class AgreementDomainTest {
    private static final Instant NOW = Instant.parse("2026-07-28T08:00:00Z");

    @Test
    void createsOneCompleteW2DraftWithDistinctStableAndVersionIdentity() {
        Agreement agreement = draft();
        assertNotEquals(agreement.id().value(), agreement.latestVersion().id().value());
        assertEquals(3, agreement.latestVersion().links().size());
        assertEquals(AgreementLifecycle.DRAFT, agreement.latestVersion().lifecycle());
    }

    @Test
    void rejectsMalformedIdentityWindowAndSameEndpoints() {
        assertThrows(IllegalArgumentException.class, () -> new AgreementId(" "));
        assertThrows(IllegalArgumentException.class,
                () -> new AgreementValidity(LocalDate.parse("2026-08-02"), LocalDate.parse("2026-08-01")));
        assertThrows(IllegalArgumentException.class, () -> Agreement.firstDraft(
                id(), number(), versionId("v1"), ref("customer"), ref("lane"), ref("origin"), ref("origin"),
                ref("equipment"), validity(), links(), "analyst", NOW, "corr"));
    }

    @Test
    void rejectsIncompleteDuplicateOrCategoryDuplicateLinks() {
        assertThrows(IllegalArgumentException.class, () -> draft(links().subList(0, 2)));
        List<AgreementRateLink> duplicateCategory = List.of(
                link(RateCategory.BASE, "r1"),
                link(RateCategory.BASE, "r2"),
                link(RateCategory.LOCAL, "r3"));
        assertThrows(IllegalArgumentException.class, () -> draft(duplicateCategory));
        List<AgreementRateLink> duplicateId = List.of(
                link(RateCategory.BASE, "r1"),
                link(RateCategory.SURCHARGE, "r1"),
                link(RateCategory.LOCAL, "r3"));
        assertThrows(IllegalArgumentException.class, () -> draft(duplicateId));
    }

    @Test
    void draftUpdateRequiresExactRowVersionAndCompleteReplacement() {
        AgreementVersion draft = draft().latestVersion();
        assertThrows(IllegalStateException.class, () -> draft.reviseDraft(
                draft.customerId(), draft.tradeLaneId(), draft.originLocationId(),
                draft.destinationLocationId(), draft.equipmentTypeId(), draft.validity(),
                draft.links(), 99, "analyst", NOW, "corr-update"));
        AgreementVersion updated = draft.reviseDraft(
                draft.customerId(), draft.tradeLaneId(), draft.originLocationId(),
                draft.destinationLocationId(), draft.equipmentTypeId(), draft.validity(),
                links("next"), 0, "analyst", NOW, "corr-update");
        assertEquals(1, updated.rowVersion());
        assertEquals("next-base", updated.linksByCategory().get(RateCategory.BASE).rateVersionId().value());
    }

    @Test
    void approvedSourceAndCommercialLinksRemainByteForByteEqualAfterSuccessor() {
        AgreementVersion approved = draft().latestVersion().approve(0, "approver", NOW, "corr-approve");
        List<AgreementRateLink> frozen = new ArrayList<>(approved.links());
        AgreementVersion successor = approved.successor(
                versionId("v2"), 2, "analyst", NOW.plusSeconds(1), "corr-successor");
        assertEquals(frozen, approved.links());
        assertEquals(frozen, successor.links());
        assertEquals(AgreementLifecycle.APPROVED, approved.lifecycle());
        assertEquals(AgreementLifecycle.DRAFT, successor.lifecycle());
        assertEquals(approved.id(), successor.sourceVersionId());
    }

    @Test
    void onlyApprovedCanSeedSuccessorAndOnlyDraftCanApprove() {
        AgreementVersion draft = draft().latestVersion();
        assertThrows(IllegalStateException.class,
                () -> draft.successor(versionId("v2"), 2, "analyst", NOW, "corr"));
        AgreementVersion approved = draft.approve(0, "approver", NOW, "corr-approve");
        assertThrows(IllegalStateException.class,
                () -> approved.approve(approved.rowVersion(), "approver", NOW, "corr"));
    }

    @Test
    void suspendAndExpireAreTerminalAndDoNotRewriteCommercialAuthority() {
        AgreementVersion approved = draft().latestVersion().approve(0, "approver", NOW, "corr-approve");
        AgreementVersion suspended = approved.suspend(1, "analyst", NOW.plusSeconds(1), "corr-suspend");
        assertEquals(approved.links(), suspended.links());
        assertEquals(AgreementLifecycle.SUSPENDED, suspended.lifecycle());
        assertThrows(IllegalStateException.class,
                () -> suspended.expire(2, "analyst", NOW, "corr-expire"));
        AgreementVersion expired = approved.expire(1, "analyst", NOW.plusSeconds(1), "corr-expire");
        assertEquals(AgreementLifecycle.EXPIRED, expired.lifecycle());
    }

    @Test
    void validityOverlapIsInclusiveAndApprovalKeyIsLengthPrefixed() {
        AgreementValidity first = validity();
        assertEquals(true, first.overlaps(new AgreementValidity(
                LocalDate.parse("2026-12-31"), LocalDate.parse("2027-01-31"))));
        assertFalse(first.overlaps(new AgreementValidity(
                LocalDate.parse("2027-01-01"), LocalDate.parse("2027-01-31"))));
        assertEquals("agreement:v1|8:customer|4:lane|6:origin|11:destination|9:equipment",
                draft().latestVersion().approvalKey());
    }

    @Test
    void activityRequiresBoundedReasonForEveryMutationExceptCreate() {
        assertThrows(IllegalArgumentException.class, () -> new AgreementActivity(
                "activity-1", id(), versionId("v1"), AgreementActivityAction.APPROVED,
                "analyst", NOW, "corr", " ", 1));
        AgreementActivity created = new AgreementActivity(
                "activity-1", id(), versionId("v1"), AgreementActivityAction.CREATED,
                "analyst", NOW, "corr", null, 0);
        assertEquals(AgreementActivityAction.CREATED, created.action());
    }

    private static Agreement draft() {
        return draft(links());
    }

    private static Agreement draft(List<AgreementRateLink> rateLinks) {
        return Agreement.firstDraft(id(), number(), versionId("v1"), ref("customer"), ref("lane"),
                ref("origin"), ref("destination"), ref("equipment"), validity(), rateLinks,
                "analyst", NOW, "corr-create");
    }

    private static AgreementId id() {
        return new AgreementId("agreement-1");
    }

    private static AgreementNumber number() {
        return new AgreementNumber("AGR-1");
    }

    private static AgreementVersionId versionId(String value) {
        return new AgreementVersionId("agreement-" + value);
    }

    private static ReferenceId ref(String value) {
        return new ReferenceId(value);
    }

    private static AgreementValidity validity() {
        return new AgreementValidity(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"));
    }

    private static AgreementRateLink link(RateCategory category, String id) {
        return new AgreementRateLink(category, new RateVersionId(id));
    }

    private static List<AgreementRateLink> links() {
        return links("rate");
    }

    private static List<AgreementRateLink> links(String prefix) {
        return List.of(
                link(RateCategory.BASE, prefix + "-base"),
                link(RateCategory.SURCHARGE, prefix + "-surcharge"),
                link(RateCategory.LOCAL, prefix + "-local"));
    }
}
