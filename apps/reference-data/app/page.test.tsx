import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";
import ReferenceDataHomePage from "./page";
import { ReferenceDataWorkbench } from "./ReferenceDataWorkbench";
import { defaultPermissionState, listRecords, referenceSetDescriptors } from "../lib/reference-data";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes("/api/permissions/reference-data")) {
      return Response.json({
        canRead: true,
        canWrite: init?.headers ? true : false,
        requestedArea: "reference-data",
        correlationId: "corr-test",
        reason: "Local auth bypass is enabled for non-production development."
      });
    }
    if (url.includes("/api/reference-sets/CURRENCY/records") && init?.method === "POST") {
      return Response.json({ status: "created", record: { id: "currency-eur" }, correlationId: "corr-test" });
    }
    if (url.includes("/api/reference-sets/CURRENCY/records")) {
      return Response.json({
        records: listRecords("CURRENCY"),
        page: 0,
        size: 25,
        total: 1,
        correlationId: "corr-test"
      });
    }
    return Response.json({ error: "not found" }, { status: 404 });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the reference data workspace", async () => {
  render(<ReferenceDataHomePage />);

  expect(screen.getByRole("heading", { name: "Reference Data" })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByTestId("permission-status")).toHaveTextContent("Write enabled"));
});

test("renders navigation for all MVP reference sets", () => {
  render(<ReferenceDataHomePage />);

  for (const descriptor of referenceSetDescriptors) {
    expect(screen.getByTestId(`reference-set-${descriptor.id}`)).toHaveTextContent(descriptor.label);
  }
});

test("renders a semantic reference records table", () => {
  render(<ReferenceDataHomePage />);

  const table = screen.getByRole("table", { name: "Reference records sorted by display name" });
  expect(within(table).getByRole("columnheader", { name: "Code" })).toBeInTheDocument();
  expect(within(table).getByText("USD")).toBeInTheDocument();
});

test("enables mutating actions when permissions allow writes", async () => {
  render(<ReferenceDataHomePage />);

  await waitFor(() => expect(screen.getByTestId("create-record")).toBeEnabled());
  expect(screen.getByTestId("edit-record")).toBeEnabled();
  expect(screen.getByTestId("deactivate-record")).toBeDisabled();
});

test("submits a create mutation through the BFF", async () => {
  render(
    <ReferenceDataWorkbench
      initialSets={referenceSetDescriptors}
      initialRecords={listRecords("CURRENCY")}
      initialPermissions={{ ...defaultPermissionState("corr-test"), canWrite: true }}
    />
  );

  await waitFor(() => expect(screen.getByTestId("create-record")).toBeEnabled());
  fireEvent.click(screen.getByTestId("create-record"));
  fireEvent.change(screen.getByTestId("draft-code"), { target: { value: "EUR" } });
  fireEvent.change(screen.getByTestId("draft-display-name"), { target: { value: "Euro" } });
  fireEvent.change(screen.getByTestId("draft-reason"), { target: { value: "Local seed" } });
  fireEvent.click(screen.getByTestId("save-record"));

  await waitFor(() => expect(screen.getByTestId("workbench-status")).toHaveTextContent("Created EUR"));
  expect(fetch).toHaveBeenCalledWith("/api/reference-sets/CURRENCY/records", expect.objectContaining({ method: "POST" }));
});

test("renders contract catalog status labels", () => {
  render(<ReferenceDataHomePage />);

  expect(screen.getByRole("heading", { name: "Contract catalog" })).toBeInTheDocument();
  expect(screen.getByTestId("contract-status-api-reference-data-service")).toHaveTextContent("Compatibility pending");
});
