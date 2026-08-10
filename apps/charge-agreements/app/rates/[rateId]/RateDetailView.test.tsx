import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { rateDetail, rateVersion } from "../../../lib/rate-test-fixtures";
import { RateDetailView } from "./RateDetailView";

describe("RateDetailView", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders read-only evidence without mutation actions", async () => {
    const readOnly = rateDetail("BASE", rateVersion(), {
      actions: { canEdit: false, canApprove: false, canCreateSuccessor: false }
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(readOnly)));
    render(<RateDetailView rateId={readOnly.rateId} editMode={false} />);

    expect(await screen.findByText("Read-only access: mutation actions are not available.")).toBeInTheDocument();
    expect(screen.queryByTestId("approve-rate")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Rate version history" })).toHaveAttribute("tabindex", "0");
  });

  it("requires evidence-bearing confirmation and disables duplicate approval while pending", async () => {
    const draft = rateDetail();
    let complete!: (response: Response) => void;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(draft))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { complete = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    render(<RateDetailView rateId={draft.rateId} editMode={false} />);
    fireEvent.click(await screen.findByTestId("approve-rate"));
    expect(screen.getByRole("dialog", { name: "Confirm immutable Rate approval" })).toBeInTheDocument();
    expect(screen.getByTestId("approval-evidence")).toHaveTextContent("rate-base / v1");
    expect(screen.getByTestId("approval-evidence")).toHaveTextContent("2026-07-01");
    fireEvent.click(screen.getByTestId("confirm-rate-approval"));
    fireEvent.click(screen.getByTestId("confirm-rate-approval"));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("confirm-rate-approval")).toBeDisabled();
    const approved = rateDetail("BASE", rateVersion({
      lifecycle: "APPROVED",
      presentationState: "EFFECTIVE",
      rowVersion: 1,
      approvedBy: "pricing-user",
      approvedAt: "2026-07-26T01:00:00.000Z"
    }), { actions: { canEdit: false, canApprove: false, canCreateSuccessor: true } });
    complete(Response.json(approved));
    await waitFor(() => expect(screen.getByText("Rate version approved.")).toBeInTheDocument());
  });
});
