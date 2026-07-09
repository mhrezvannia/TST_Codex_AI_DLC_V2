import { render, screen, waitFor } from "@testing-library/react";
import ChargeAgreementsHomePage from "./page";
import { skeletonModuleInfo } from "../lib/charge-agreements";

describe("ChargeAgreementsHomePage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ ...skeletonModuleInfo, backendStatus: "fallback" })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the walking skeleton workbench", async () => {
    render(<ChargeAgreementsHomePage />);

    expect(screen.getByRole("heading", { name: "Charge Agreements" })).toBeInTheDocument();
    expect(screen.getByTestId("new-agreement")).toBeDisabled();
    expect(screen.getAllByText("AGR-SKEL-001")).toHaveLength(2);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/module-info", { cache: "no-store" }));
  });
});
