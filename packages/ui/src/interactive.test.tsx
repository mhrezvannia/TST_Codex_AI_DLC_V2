import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Combobox, Dialog, Tabs, ThemeToggle, Toasts, type ComboOption } from "./interactive";

describe("Tabs", () => {
  const tabs = [
    { id: "summary", label: "Summary", content: <p>summary body</p> },
    { id: "routing", label: "Routing", content: <p>routing body</p> },
    { id: "history", label: "History", content: <p>history body</p> }
  ];

  it("shows the first tab's panel by default and switches on click", () => {
    render(<Tabs tabs={tabs} aria-label="Booking detail" />);
    expect(screen.getByText("summary body")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Routing" }));
    expect(screen.getByText("routing body")).toBeTruthy();
    expect(screen.queryByText("summary body")).toBeNull();
  });

  it("moves selection with ArrowRight/Home keyboard navigation", () => {
    render(<Tabs tabs={tabs} aria-label="Booking detail" />);
    const first = screen.getByRole("tab", { name: "Summary" });
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Routing" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Routing" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "Summary" }).getAttribute("aria-selected")).toBe("true");
  });
});

describe("Combobox", () => {
  const options: ComboOption[] = [
    { value: "USNYC", label: "New York (USNYC)" },
    { value: "NLRTM", label: "Rotterdam (NLRTM)" },
    { value: "USLAX", label: "Los Angeles (USLAX)" }
  ];

  function Harness() {
    const [value, setValue] = useState("");
    return (
      <>
        <Combobox options={options} value={value} onChange={setValue} aria-label="Port" placeholder="Pick a port" />
        <output>{value}</output>
      </>
    );
  }

  it("filters options by query and selects on click", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Port" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rotter" } });
    expect(screen.getByRole("option", { name: "Rotterdam (NLRTM)" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "New York (USNYC)" })).toBeNull();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Rotterdam (NLRTM)" }));
    expect(screen.getByText("NLRTM")).toBeTruthy();
  });

  it("shows an empty message when nothing matches", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Port" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("No matches")).toBeTruthy();
  });
});

describe("Dialog", () => {
  it("renders when open and calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Dialog open title="Confirm booking" onClose={onClose}>body</Dialog>);
    expect(screen.getByRole("dialog", { name: "Confirm booking" })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing when closed", () => {
    render(<Dialog open={false} title="Hidden" onClose={() => undefined}>body</Dialog>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Toasts", () => {
  it("renders messages and dismisses", () => {
    const onDismiss = vi.fn();
    render(<Toasts toasts={[{ id: "t1", tone: "success", message: "Saved" }]} onDismiss={onDismiss} />);
    expect(screen.getByText("Saved")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });
});

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    try { localStorage.removeItem("erp-theme"); } catch { /* noop */ }
  });

  it("flips data-theme and persists to localStorage on click", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    // useEffect applies an initial theme (light in jsdom without matchMedia)
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("erp-theme")).toBe("dark");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("erp-theme")).toBe("light");
  });
});
