import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlatformShell } from "./index";

describe("PlatformShell module navigation", () => {
  it("renders shared module links and marks the current module", () => {
    render(<PlatformShell title="Reference Data"><p>Reference workspace</p></PlatformShell>);

    expect(screen.getByRole("navigation", { name: "LinerCore modules" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Booking" })).toHaveAttribute("href", "/booking");
    expect(screen.getByRole("link", { name: "Reference data" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Reference data" })).toHaveAttribute("href", "/reference-data/");
    expect(screen.getByRole("link", { name: "Charge agreements" })).toHaveAttribute("href", "/charge-agreements");
  });
});
