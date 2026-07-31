import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AgreementFormEditor } from "./AgreementForm";

afterEach(() => vi.unstubAllGlobals());

test("associates validation errors, focuses a linked summary, and preserves entered values", async () => {
  render(<AgreementFormEditor />);
  const agreementNumber = screen.getByLabelText("Agreement number");
  fireEvent.change(agreementNumber, { target: { value: "AGR-1" } });
  fireEvent.click(screen.getByTestId("save-agreement"));

  const summary = await screen.findByRole("alert");
  await waitFor(() => expect(summary).toHaveFocus());
  expect(agreementNumber).toHaveValue("AGR-1");

  const customer = screen.getByLabelText("Customer ID");
  expect(customer).toHaveAttribute("aria-invalid", "true");
  const describedBy = customer.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy!)).toHaveTextContent(/at least 1 character/i);

  const customerLink = screen.getByRole("link", { name: /customer id:/i });
  expect(customerLink).toHaveAttribute("href", "#agreement-customerId");
  fireEvent.click(customerLink);
  expect(customer).toHaveFocus();
});

test("focuses and announces service failures while preserving values and field associations", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    code: "AGREEMENT_REFERENCE_INVALID",
    message: "Customer reference is inactive",
    fields: [{
      path: "customerId",
      code: "REFERENCE_INACTIVE",
      message: "Select an active customer"
    }],
    correlationId: "corr-1"
  }), { status: 422 })));

  render(<AgreementFormEditor />);
  fillValidForm();
  fireEvent.click(screen.getByTestId("save-agreement"));

  const summary = await screen.findByRole("alert");
  await waitFor(() => expect(summary).toHaveFocus());
  expect(summary).toHaveTextContent("Customer reference is inactive");
  expect(screen.getByLabelText("Agreement number")).toHaveValue("AGR-1");
  expect(screen.getByLabelText("Customer ID")).toHaveValue("customer-1");
  expect(screen.getByLabelText("Customer ID")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("link", { name: "Customer ID: Select an active customer" }))
    .toHaveAttribute("href", "#agreement-customerId");
});

function fillValidForm() {
  const values: Record<string, string> = {
    "Agreement number": "AGR-1",
    "Customer ID": "customer-1",
    "Trade lane ID": "lane-1",
    "Origin location ID": "origin-1",
    "Destination location ID": "destination-1",
    "Equipment type ID": "equipment-1",
    "Valid from": "2026-08-01",
    "Valid to": "2026-08-31",
    "Base / OFR RateVersion ID": "rate-base-1",
    "Surcharge / BAF RateVersion ID": "rate-baf-1",
    "Local / THC RateVersion ID": "rate-thc-1",
    Reason: "Create the initial commercial draft"
  };
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}
