import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingCreateForm } from "./BookingCreateForm";
import type { BookingReferenceCatalog } from "../../../lib/bookings";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("BookingCreateForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("focuses a linked error summary for invalid fields", async () => {
    render(<BookingCreateForm options={catalog} />);

    fireEvent.click(screen.getByTestId("booking-submit"));

    const summary = await screen.findByText("Booking not created");
    await waitFor(() => expect(document.activeElement).toBe(summary.parentElement));
    const customerLink = screen.getAllByRole("link", { name: "Required" })[0];
    expect(customerLink.getAttribute("href")).toBe("#booking-customerId");
  });

  it("prevents duplicate draft submission while the request is active", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<BookingCreateForm options={catalog} />);

    selectOption("booking-customerId", /CUST-1 - Local Demo Carrier/);
    selectOption("booking-voyageId", /LC002E - LinerCore Atlas/);
    selectOption("booking-equipmentTypeCode", /22G1 - 20 foot dry/);
    fireEvent.change(screen.getByTestId("booking-equipmentId"), {
      target: { value: "LCRU1000055" }
    });
    fireEvent.change(screen.getByTestId("booking-commodityCode"), {
      target: { value: "GENERAL" }
    });

    const submit = screen.getByTestId("booking-submit");
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(submit.getAttribute("aria-busy")).toBe("true");
    expect(submit).toBeDisabled();
  });

  it("redirects to the created Booking record after a successful idempotent request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      id: "ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a",
      status: "DRAFT"
    }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<BookingCreateForm options={catalog} />);
    enterValidDraft();

    fireEvent.click(screen.getByTestId("booking-submit"));

    await waitFor(() => expect(push).toHaveBeenCalledWith(
      "/bookings/ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a?created=1"
    ));
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(request.headers).get("idempotency-key")).toBeTruthy();
  });
});

function selectOption(testId: string, optionName: RegExp) {
  const input = screen.getByTestId(testId);
  fireEvent.focus(input);
  fireEvent.mouseDown(screen.getByRole("option", { name: optionName }));
}

function enterValidDraft() {
  selectOption("booking-customerId", /CUST-1 - Local Demo Carrier/);
  selectOption("booking-voyageId", /LC002E - LinerCore Atlas/);
  selectOption("booking-equipmentTypeCode", /22G1 - 20 foot dry/);
  fireEvent.change(screen.getByTestId("booking-equipmentId"), {
    target: { value: "LCRU1000055" }
  });
  fireEvent.change(screen.getByTestId("booking-commodityCode"), {
    target: { value: "GENERAL" }
  });
}

const catalog: BookingReferenceCatalog = {
  customers: [{
    id: "party-1",
    code: "CUST-1",
    displayName: "Local Demo Carrier",
    version: 1,
    attributes: {}
  }],
  locations: [{
    id: "location-usnyc",
    code: "USNYC",
    displayName: "New York",
    version: 1,
    attributes: {}
  }, {
    id: "location-nlrtm",
    code: "NLRTM",
    displayName: "Rotterdam",
    version: 1,
    attributes: {}
  }],
  voyages: [{
    id: "voyage-2",
    code: "LC002E",
    displayName: "LinerCore Atlas",
    version: 1,
    attributes: {
      recordType: "VOYAGE",
      originLocationId: "location-usnyc",
      destinationLocationId: "location-nlrtm"
    }
  }],
  equipment: [{
    id: "equipment-22g1",
    code: "22G1",
    displayName: "20 foot dry",
    version: 1,
    attributes: {}
  }]
};
