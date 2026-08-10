import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import ShellSignedOutPage from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

describe("ShellSignedOutPage", () => {
  it("delegates the legacy Shell route to the canonical Auth signed-out page", async () => {
    await ShellSignedOutPage({});

    expect(redirect).toHaveBeenCalledWith("/auth/signed-out");
  });

  it("preserves only supported state and the candidate return destination", async () => {
    await ShellSignedOutPage({
      searchParams: Promise.resolve({
        reason: "expired",
        returnUrl: "/bookings/booking-1"
      })
    });

    expect(redirect).toHaveBeenCalledWith(
      "/auth/signed-out?reason=expired&returnUrl=%2Fbookings%2Fbooking-1"
    );
  });

  it("drops an unsupported reason", async () => {
    await ShellSignedOutPage({
      searchParams: Promise.resolve({
        reason: "unexpected"
      })
    });

    expect(redirect).toHaveBeenCalledWith("/auth/signed-out");
  });
});
