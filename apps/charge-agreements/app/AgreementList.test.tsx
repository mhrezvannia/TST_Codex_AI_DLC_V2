import { render, screen, waitFor } from "@testing-library/react";
import { AgreementList } from "./AgreementList";

test("renders populated W2 and read-only authority rows", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    items: [{
      agreementId: "agreement-1", agreementNumber: "AGR-1", authorityModel: "W2_VERSIONED",
      selectedVersion: null, approvedVersion: null, hasDraft: true, w2AuthorityEligible: true, readOnly: false
    }], page: 0, size: 25, total: 1, hasMore: false, canCreate: true
  }), { status: 200 })));
  render(<AgreementList />);
  expect(screen.getByTestId("agreement-list-status")).toHaveTextContent("Loading");
  await waitFor(() => expect(screen.getByTestId("agreement-row-agreement-1")).toBeInTheDocument());
  expect(screen.getByTestId("create-agreement-link")).toBeInTheDocument();
  vi.unstubAllGlobals();
});
