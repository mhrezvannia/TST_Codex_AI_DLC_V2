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
    expect(screen.getByTestId("shell-nav-booking")).toBeInTheDocument();
    expect(screen.queryByTestId("shell-nav-reference-data")).not.toBeInTheDocument();
    expect(screen.queryByText("Charge agreements")).not.toBeInTheDocument();
  });

  it("shows only the mounted module granted to a reference-data user", () => {
    render(
      <ShellFrame
        activePath="home"
        breadcrumbs={["Home"]}
        session={{
          isAuthenticated: true,
          subject: "local.reference.admin",
          displayName: "Reference Data Administrator",
          roles: ["reference-admin"],
          permissions: ["reference-data:read"]
        }}
      >
        <p>Reference workspace</p>
      </ShellFrame>
    );

    expect(screen.getByTestId("shell-nav-reference-data")).toBeInTheDocument();
    expect(screen.queryByTestId("shell-nav-booking")).not.toBeInTheDocument();
    expect(screen.queryByText(/disabled/i)).not.toBeInTheDocument();
  });
});
