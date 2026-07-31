package com.linercore.platform.chargeagreement.applicationservice.agreement;

import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import java.util.List;

public final class AgreementViews {
    private AgreementViews() {
    }

    public record Capabilities(
            boolean canCreate,
            boolean canUpdate,
            boolean canApprove,
            boolean canCreateSuccessor,
            boolean canSuspend,
            boolean canExpire) {
    }

    public record Detail(
            Agreement agreement,
            AgreementVersion selectedVersion,
            AgreementVersion approvedVersion,
            List<AgreementActivity> activity,
            Capabilities capabilities,
            boolean w2AuthorityEligible,
            boolean readOnly) {
        public Detail {
            activity = List.copyOf(activity);
        }
    }

    public record ListItem(
            String agreementId,
            String agreementNumber,
            AgreementAuthorityModel authorityModel,
            AgreementVersion selectedVersion,
            AgreementVersion approvedVersion,
            boolean hasDraft,
            boolean w2AuthorityEligible,
            boolean readOnly) {
    }

    public record Page(
            List<ListItem> items,
            int page,
            int size,
            long total,
            boolean hasMore,
            boolean canCreate) {
        public Page {
            items = List.copyOf(items);
        }
    }
}
