import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { rateDetail } from "../../lib/rate-test-fixtures";
import { RateFormEditor } from "./RateForm";

describe("RateFormEditor", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("switches category shape and removes destination for Local THC", () => {
    render(<RateFormEditor />);

    fireEvent.change(screen.getByTestId("rate-category"), { target: { value: "LOCAL" } });

    expect(screen.getByDisplayValue("THC")).toBeInTheDocument();
    expect(screen.queryByLabelText("Destination location")).not.toBeInTheDocument();
    expect(screen.getByText("Local THC authority has no destination.")).toBeInTheDocument();
  });

  it("focuses a linked error summary and does not submit invalid precision", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RateFormEditor />);
    fireEvent.change(screen.getByTestId("rate-unit-rate"), { target: { value: "10.999" } });
    fireEvent.click(screen.getByTestId("save-rate"));

    await waitFor(() => expect(screen.getByTestId("rate-form-error-summary")).toHaveFocus());
    expect(screen.getAllByText(/at most two decimals/i)).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves entered values and exposes field errors after a semantic conflict", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      code: "RATE_REFERENCE_INVALID",
      message: "One or more references are invalid",
      fields: [{ field: "equipmentTypeId", reason: "inactive" }]
    }, { status: 422 })));
    render(<RateFormEditor initialDetail={rateDetail()} />);
    fireEvent.change(screen.getByTestId("rate-unit-rate"), { target: { value: "135.25" } });
    fireEvent.click(screen.getByTestId("save-rate"));

    expect(await screen.findAllByText("inactive")).toHaveLength(2);
    expect(screen.getByTestId("rate-unit-rate")).toHaveValue("135.25");
    expect(screen.getAllByText("One or more references are invalid")).toHaveLength(2);
  });

  it("prevents duplicate submission while a command is pending", async () => {
    let complete!: (value: Response) => void;
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => { complete = resolve; })));
    render(<RateFormEditor initialDetail={rateDetail()} />);

    fireEvent.click(screen.getByTestId("save-rate"));
    fireEvent.click(screen.getByTestId("save-rate"));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("save-rate")).toBeDisabled();
    complete(Response.json(rateDetail()));
    await waitFor(() => expect(screen.getByText("Draft changes saved.")).toBeInTheDocument());
  });
});
