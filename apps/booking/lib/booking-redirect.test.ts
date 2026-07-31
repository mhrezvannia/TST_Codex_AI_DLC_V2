import { afterEach, describe, expect, it } from "vitest";
import { canonicalBookingRedirect, canonicalShellOrigin } from "./booking-redirect";

const shell = new URL("https://erp.example");
const originalShellPublicUrl = process.env.SHELL_PUBLIC_URL;

describe("canonical Booking redirects", () => {
  afterEach(() => {
    if (originalShellPublicUrl === undefined) delete process.env.SHELL_PUBLIC_URL;
    else process.env.SHELL_PUBLIC_URL = originalShellPublicUrl;
  });

  it("defaults to the shared manager edge and accepts an explicit isolated Wave A origin", () => {
    delete process.env.SHELL_PUBLIC_URL;
    expect(canonicalShellOrigin().toString()).toBe("http://127.0.0.1:8088/");
    process.env.SHELL_PUBLIC_URL = "http://127.0.0.1:18088";
    expect(canonicalShellOrigin().toString()).toBe("http://127.0.0.1:18088/");
  });
  it("uses 308 and the exact list allow-list with first non-empty values", () => {
    const decision = canonicalBookingRedirect(new Request("http://internal/bookings?page=&page=2&pageSize=25&sort=createdAt&direction=desc&status=DRAFT&q=BKG&returnTo=https://evil.example"), shell);
    expect(decision?.status).toBe(308);
    expect(decision?.destination.toString()).toBe("https://erp.example/booking?page=2&pageSize=25&sort=createdAt&direction=desc&status=DRAFT&q=BKG");
  });

  it("drops all create query and preserves detail-only created=1", () => {
    expect(canonicalBookingRedirect(new Request("http://internal/bookings/new?created=1"), shell)?.destination.toString()).toBe("https://erp.example/booking/new");
    expect(canonicalBookingRedirect(new Request("http://internal/bookings/BKG%3A1?created=1&returnTo=https://evil.example"), shell)?.destination.toString()).toBe("https://erp.example/booking/BKG%3A1?created=1");
  });

  it("falls invalid detail back to list and excludes APIs/non-presentation paths", () => {
    expect(canonicalBookingRedirect(new Request("http://internal/bookings/bad%2Fid"), shell)?.destination.toString()).toBe("https://erp.example/booking");
    expect(canonicalBookingRedirect(new Request("http://internal/api/bookings"), shell)).toBeNull();
    expect(canonicalBookingRedirect(new Request("http://internal/health"), shell)).toBeNull();
  });
});
