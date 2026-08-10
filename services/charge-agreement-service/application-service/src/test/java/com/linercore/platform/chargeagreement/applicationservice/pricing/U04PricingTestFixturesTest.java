package com.linercore.platform.chargeagreement.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.util.List;
import org.junit.jupiter.api.Test;

class U04PricingTestFixturesTest {

    @Test
    void coversAgreementTariffMissingAmbiguousLegacyAndBackfillShapes() {
        var agreement = U04PricingTestFixtures.approvedAgreementWithThreeLinkedRates();
        assertEquals(3, agreement.agreement().links().size());
        assertEquals(3, agreement.linkedRates().size());
        assertEquals(List.of(RateCategory.BASE, RateCategory.SURCHARGE, RateCategory.LOCAL),
                U04PricingTestFixtures.completeTariff().stream().map(source -> source.category()).toList());

        for (RateCategory category : RateCategory.values()) {
            assertTrue(U04PricingTestFixtures.missing(category).get(category).isEmpty());
            assertEquals(2, U04PricingTestFixtures.ambiguous(category).get(category).size());
        }
        assertTrue(U04PricingTestFixtures.mixedMissingAndAmbiguous().get(RateCategory.BASE).isEmpty());
        assertEquals(2, U04PricingTestFixtures.mixedMissingAndAmbiguous()
                .get(RateCategory.SURCHARGE).size());

        assertEquals("COMPLETED", U04PricingTestFixtures.legacyReceiptRow().status());
        assertTrue(U04PricingTestFixtures.canonicalBackfilledWinner().legacyEvidence());
        assertFalse(U04PricingTestFixtures.canonicalBackfilledWinner().dedupeKey().isBlank());
    }
}
