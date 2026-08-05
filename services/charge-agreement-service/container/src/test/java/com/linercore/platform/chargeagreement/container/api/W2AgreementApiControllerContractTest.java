package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationException;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementCommands;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementViews;
import com.linercore.platform.chargeagreement.container.security.ChargeSubjectAssertionFilter;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class W2AgreementApiControllerContractTest {
    private AgreementApplicationService w2Service;
    private ChargeAgreementApplicationService legacyService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        w2Service = mock(AgreementApplicationService.class);
        legacyService = mock(ChargeAgreementApplicationService.class);
        when(legacyService.search(any())).thenReturn(List.of());
        when(w2Service.search(any())).thenReturn(new AgreementViews.Page(
                List.of(), 0, 25, 0, false, true));
        mvc = MockMvcBuilders.standaloneSetup(
                        new ChargeAgreementApiController(legacyService),
                        new W2AgreementApiController(w2Service))
                .build();
    }

    @Test
    void defaultJsonSelectsOnlyLegacyDialectAndRetainsExactEmptyBytes() throws Exception {
        mvc.perform(get("/api/charge-agreements")
                        .accept(MediaType.APPLICATION_JSON)
                        .param("actor", "spoofed"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {"items":[],"page":0,"size":25,"returned":0}
                        """, true));

        verify(legacyService).search(any());
    }

    @Test
    void exactVendorAcceptSelectsW2AndConsumesVerifiedSubjectOnly() throws Exception {
        mvc.perform(get("/api/charge-agreements")
                        .accept(W2AgreementApiController.MEDIA_TYPE)
                        .header("X-Correlation-Id", "corr-1")
                        .requestAttr(
                                ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE,
                                "trusted-subject"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(W2AgreementApiController.MEDIA_TYPE))
                .andExpect(jsonPath("$.canCreate").value(true));

        ArgumentCaptor<com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementSearchQuery>
                query = ArgumentCaptor.forClass(
                        com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementSearchQuery.class);
        verify(w2Service).search(query.capture());
        assertEquals("trusted-subject", query.getValue().subjectId());
        assertEquals("corr-1", query.getValue().correlationId());
    }

    @Test
    void mixedMutationMediaIsRejectedWithoutAdapterFallthrough() throws Exception {
        mvc.perform(post("/api/charge-agreements")
                        .accept(W2AgreementApiController.MEDIA_TYPE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotAcceptable());

        mvc.perform(post("/api/charge-agreements")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(W2AgreementApiController.MEDIA_TYPE)
                        .content("{}"))
                .andExpect(status().isNotAcceptable());
    }

    @Test
    void nestedApproveRouteCarriesExactVersionAndTrustedSubject() throws Exception {
        when(w2Service.approve(any())).thenThrow(new AgreementApplicationException(
                409, "AGREEMENT_STALE_VERSION", "Agreement version changed"));

        mvc.perform(post("/api/charge-agreements/agreement-1/versions/version-2/approve")
                        .accept(W2AgreementApiController.MEDIA_TYPE)
                        .contentType(W2AgreementApiController.MEDIA_TYPE)
                        .header("X-Correlation-Id", "corr-approve")
                        .requestAttr(
                                ChargeSubjectAssertionFilter.VERIFIED_SUBJECT_ATTRIBUTE,
                                "trusted-approver")
                        .content("""
                                {"expectedRowVersion":3,"reason":"four eyes"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("AGREEMENT_STALE_VERSION"))
                .andExpect(jsonPath("$.correlationId").value("corr-approve"));

        ArgumentCaptor<AgreementCommands.Approve> command =
                ArgumentCaptor.forClass(AgreementCommands.Approve.class);
        verify(w2Service).approve(command.capture());
        assertEquals("agreement-1", command.getValue().agreementId());
        assertEquals("version-2", command.getValue().agreementVersionId());
        assertEquals("trusted-approver", command.getValue().subjectId());
    }

    @Test
    void typedFieldFailuresRemainSanitizedAndCorrelated() {
        W2AgreementApiController controller = new W2AgreementApiController(w2Service);
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.addHeader("X-Correlation-Id", "corr-error");
        var response = controller.applicationFailure(
                new AgreementApplicationException(
                        422,
                        "AGREEMENT_REFERENCE_INVALID",
                        "One or more references are invalid",
                        List.of(new AgreementApplicationException.FieldError("customerId", "inactive"))),
                request);

        assertEquals(422, response.getStatusCode().value());
        assertEquals("corr-error", response.getBody().correlationId());
        assertEquals("customerId", response.getBody().fields().getFirst().field());
        assertTrue(response.getBody().message().contains("references"));
    }
}
