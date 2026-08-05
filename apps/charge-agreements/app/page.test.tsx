import { render, screen } from "@testing-library/react";
import ChargeAgreementsHomePage from "./page";

describe("ChargeAgreementsHomePage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [],
      page: 0,
      size: 25,
      total: 0,
      hasMore: false,
      canCreate: false
    }), { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the agreement authority list lifecycle", async () => {
    render(<ChargeAgreementsHomePage />);

    expect(screen.getByRole("heading", { name: "Charge agreements" })).toBeInTheDocument();
    expect(screen.getByTestId("agreement-list-status")).toHaveTextContent("Loading");
    expect(await screen.findByText("No agreements match these filters")).toBeInTheDocument();
    expect(screen.queryByTestId("create-agreement-link")).not.toBeInTheDocument();
  });
});
