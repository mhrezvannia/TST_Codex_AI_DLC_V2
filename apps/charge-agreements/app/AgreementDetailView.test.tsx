import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AgreementDetailView } from "./AgreementDetailView";

afterEach(() => vi.unstubAllGlobals());

test("renders stable/version identity, links, lifecycle and activity evidence", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    agreementId: "agreement-1", agreementNumber: "AGR-1", authorityModel: "W2_VERSIONED",
    selectedVersion: version(), approvedVersion: null, versions: [version()],
    activity: [{
      activityId: "activity-1", agreementVersionId: "version-1", action: "CREATED",
      actorSubjectId: "subject-1", occurredAt: "2026-07-28T00:00:00Z",
      correlationId: "corr-1", reason: null, resultingRowVersion: 0
    }],
    capabilities: { canCreate: true, canUpdate: true, canApprove: true, canCreateSuccessor: false, canSuspend: false, canExpire: false },
    w2AuthorityEligible: true, readOnly: false
  }), { status: 200 })));
  render(<AgreementDetailView agreementId="agreement-1" />);
  await waitFor(() => expect(screen.getByText("AGR-1")).toBeInTheDocument());
  expect(screen.getByText("version-1")).toBeInTheDocument();
  expect(screen.getByText("base-1")).toBeInTheDocument();
  expect(screen.getByTestId("approve-agreement")).toBeInTheDocument();
});

test.each([
  ["approve", "DRAFT", "approve-agreement", "Approve Agreement", "/versions/version-1/approve"],
  ["suspend", "APPROVED", "suspend-agreement", "Suspend Agreement", "/suspend"],
  ["expire", "APPROVED", "expire-agreement", "Expire Agreement", "/expire"]
] as const)("requires confirmation evidence before the %s request", async (
  action,
  lifecycle,
  triggerTestId,
  command,
  expectedPath
) => {
  const detail = agreementDetail(lifecycle, action);
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(detail), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<AgreementDetailView agreementId="agreement-1" />);

  const trigger = await screen.findByTestId(triggerTestId);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.click(trigger);

  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText("Reason"), {
    target: { value: `${action} with signed evidence` }
  });
  fireEvent.click(screen.getByRole("button", { name: command }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  const [path, init] = fetchMock.mock.calls[1] as [string, RequestInit];
  expect(path).toContain(expectedPath);
  expect(JSON.parse(String(init.body))).toMatchObject({
    reason: `${action} with signed evidence`,
    expectedRowVersion: 0
  });
});

function agreementDetail(
  lifecycle: "DRAFT" | "APPROVED",
  action: "approve" | "suspend" | "expire"
) {
  const selected = version(lifecycle);
  return {
    agreementId: "agreement-1",
    agreementNumber: "AGR-1",
    authorityModel: "W2_VERSIONED",
    selectedVersion: selected,
    approvedVersion: lifecycle === "APPROVED" ? selected : null,
    versions: [selected],
    activity: [],
    capabilities: {
      canCreate: true,
      canUpdate: lifecycle === "DRAFT",
      canApprove: action === "approve",
      canCreateSuccessor: false,
      canSuspend: action === "suspend",
      canExpire: action === "expire"
    },
    w2AuthorityEligible: true,
    readOnly: false
  };
}

function version(lifecycle: "DRAFT" | "APPROVED" = "DRAFT") {
  return {
    agreementVersionId: "version-1", versionNo: 1, lifecycle, rowVersion: 0,
    sourceAgreementVersionId: null, customerId: "customer-1", tradeLaneId: "lane-1",
    originLocationId: "origin-1", destinationLocationId: "destination-1", equipmentTypeId: "equipment-1",
    commodityId: null, validFrom: "2026-08-01", validTo: "2026-08-31",
    rateLinks: [
      { category: "BASE", rateVersionId: "base-1" },
      { category: "SURCHARGE", rateVersionId: "surcharge-1" },
      { category: "LOCAL", rateVersionId: "local-1" }
    ],
    createdBy: "subject-1", createdAt: "2026-07-28T00:00:00Z",
    updatedBy: null, updatedAt: null, approvedBy: null, approvedAt: null, correlationId: "corr-1"
  };
}
