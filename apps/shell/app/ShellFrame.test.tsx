import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShellFrame } from "./ShellFrame";

describe("ShellFrame", () => {
  it("renders sign-out as a posted session-ending user-menu action", () => {
    render(
      <ShellFrame
        activePath="home"
        breadcrumbs={["Shell", "Overview"]}
        session={{
          isAuthenticated: true,
          subject: "local.booking.user",
          displayName: "Booking User",
          roles: ["booking-desk"],
          permissions: ["booking:read"]
        }}
      >
        <p>Workspace content</p>
      </ShellFrame>
    );

    const signOut = screen.getByTestId("shell-sign-out-button");
    expect(signOut).toHaveTextContent("Sign out");
    expect(signOut.closest("form")?.getAttribute("method")).toBe("post");
    expect(signOut.closest("form")?.getAttribute("action")).toBe("/api/auth/sign-out");
    expect(screen.getByTestId("shell-user-menu")).toHaveTextContent("local.booking.user");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });
});
