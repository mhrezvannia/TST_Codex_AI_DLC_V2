import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ratePage } from "../../lib/rate-test-fixtures";
import { RateList } from "./RateList";

describe("RateList", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders populated history-aware rows in an accessible overflow region", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(ratePage())));
    render(<RateList />);

    expect(await screen.findByTestId("rate-row-rate-base")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Charge rate results" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("125.50 USD")).toBeInTheDocument();
  });

  it("renders empty and retryable service states", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(ratePage([])))
      .mockResolvedValueOnce(Response.json({ message: "Dependency unavailable" }, { status: 503 }))
      .mockResolvedValueOnce(Response.json(ratePage()));
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<RateList />);
    expect(await screen.findByText("No rates match these filters")).toBeInTheDocument();
    unmount();

    render(<RateList />);
    expect(await screen.findAllByText("Dependency unavailable")).toHaveLength(2);
    fireEvent.click(screen.getByTestId("retry-rate-list"));
    expect(await screen.findByTestId("rate-row-rate-base")).toBeInTheDocument();
  });

  it("applies canonical filter query without losing the operational status announcement", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(ratePage())));
    render(<RateList />);
    await screen.findByTestId("rate-row-rate-base");
    fireEvent.change(screen.getByLabelText("Search rate or charge code"), { target: { value: "OFR" } });
    fireEvent.click(screen.getByTestId("apply-rate-filters"));

    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("q=OFR"), { cache: "no-store" }));
    expect(screen.getByTestId("rate-list-status")).toHaveAttribute("aria-live", "polite");
  });

  it("hides creation commands for a read-only Rate user", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      ...ratePage([]),
      canCreate: false
    })));
    render(<RateList />);

    expect(await screen.findByText(/Your access is read-only\./)).toBeInTheDocument();
    expect(screen.queryByTestId("create-rate-link")).not.toBeInTheDocument();
  });
});
