import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessDeniedPanel } from "./AccessDeniedPanel";

describe("AccessDeniedPanel", () => {
  it("renders authenticated denied context and request-access action", () => {
    render(
      <AccessDeniedPanel
        action="read"
        correlationId="corr-deny"
        message="booking command denied"
        resource="booking"
        session={{
          isAuthenticated: true,
          subject: "local.reference.admin",
          displayName: "Local Reference Admin",
          roles: ["reference-admin"],
          permissions: ["reference-data:create"]
        }}
      />
    );

    expect(screen.getByTestId("shell-access-denied")).toHaveTextContent("Access denied");
    expect(screen.getByTestId("shell-access-denied")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("local.reference.admin")).toBeInTheDocument();
    expect(screen.getByTestId("shell-request-access").getAttribute("href"))
      .toBe("/auth/request-access?resource=booking&action=read&correlationId=corr-deny");
    expect(screen.getByTestId("shell-denied-home").getAttribute("href")).toBe("/");
  });
});
