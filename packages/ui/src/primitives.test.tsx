import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EnvironmentBadge,
  FailureState,
  Field,
  Input,
  ProductWordmark,
  SideNavigation,
  StatusBadge
} from "./primitives";

describe("shared ERP primitives", () => {
  it("maps raw status enums to sentence-case text with a non-color marker", () => {
    render(<StatusBadge status="MANUAL_PRICING" />);

    expect(screen.getByText("Manual pricing")).toBeTruthy();
    expect(screen.getByText("Manual pricing").querySelector("[aria-hidden='true']")).toBeTruthy();
  });

  it("links required field errors to the control", () => {
    render(
      <Field
        label="Equipment ID"
        htmlFor="equipment"
        error="Check digit is invalid"
        errorId="equipment-error"
        required
      >
        <Input id="equipment" aria-describedby="equipment-error" />
      </Field>
    );

    expect(screen.getByLabelText(/Equipment ID/).getAttribute("aria-describedby")).toBe("equipment-error");
    expect(screen.getByText("Check digit is invalid").id).toBe("equipment-error");
  });

  it("uses a focusable page heading for route-level failures", () => {
    render(
      <FailureState icon="cloud-off" title="Booking is temporarily unavailable">
        <p>Try again later.</p>
      </FailureState>
    );

    expect(screen.getByRole("heading", { level: 1 }).getAttribute("tabindex")).toBe("-1");
  });

  it("renders shared product identity and semantic authorized navigation", () => {
    render(
      <>
        <ProductWordmark href="/" context="Shipping operations platform" />
        <EnvironmentBadge>Local demo</EnvironmentBadge>
        <SideNavigation
          items={[
            { href: "/", label: "Home", icon: "home" },
            { href: "/bookings", label: "Bookings", icon: "clipboard-list", active: true }
          ]}
        />
      </>
    );

    expect(screen.getByRole("link", { name: "LinerCore home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Local demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bookings" })).toHaveAttribute("aria-current", "page");
  });
});
