import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, EmptyState, Field, Input, Skeleton, StatusBadge, StatusStrip, Table, TableContainer } from "./primitives";

describe("shared primitive contracts", () => {
  it("forwards standard DOM props and refs", () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const inputRef = createRef<HTMLInputElement>();
    render(<><Button ref={buttonRef} aria-busy="true">Save</Button><Input ref={inputRef} aria-label="Reference" /></>);
    expect(buttonRef.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(buttonRef.current?.getAttribute("aria-busy")).toBe("true");
    expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Reference" }));
  });

  it("provides busy/live semantics without domain vocabulary", () => {
    render(<StatusStrip tone="warning" role="status" aria-busy="true">Pricing unavailable</StatusStrip>);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.className).toContain("erp-status--warning");
  });

  it("exposes generic hint and error ids for described-by wiring", () => {
    render(<Field label="Port" htmlFor="port" hint="UN/LOCODE" hintId="port-hint" error="Required" errorId="port-error"><Input id="port" aria-describedby="port-error" /></Field>);
    expect(screen.getByText("Required").id).toBe("port-error");
    expect(screen.getByRole("textbox", { name: "Port" }).getAttribute("aria-describedby")).toBe("port-error");
  });

  it("contains wide tables in the shared scroll region", () => {
    render(<TableContainer data-testid="table-region"><Table aria-label="Records"><tbody><tr><td>One</td></tr></tbody></Table></TableContainer>);
    expect(screen.getByTestId("table-region").className).toContain("erp-table-container");
    expect(screen.getByRole("table", { name: "Records" })).toBeTruthy();
  });

  it("keeps skeletons decorative and empty states semantic-prop capable", () => {
    render(<><Skeleton data-testid="skeleton" /><EmptyState title="No records" role="status" /></>);
    expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("status")).toHaveTextContent("No records");
  });

  it("renders domain statuses as readable labels while preserving the canonical value", () => {
    render(<StatusBadge status="VALIDATION_BLOCKED" />);
    const badge = screen.getByText("Validation blocked");
    expect(badge).toHaveAttribute("data-status", "VALIDATION_BLOCKED");
    expect(badge.className).toContain("erp-badge--danger");
  });
});
