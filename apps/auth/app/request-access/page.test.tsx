import { render, screen } from "@testing-library/react";
import RequestAccessPage from "./page";

test("renders an honest unsupported state without a fake submission form", async () => {
  render(await RequestAccessPage({
    searchParams: Promise.resolve({
      resource: "Reference Data",
      action: "create a reference",
      correlationId: "corr-2"
    })
  }));

  expect(screen.getByRole("heading", { name: "Access requests are not available here" })).toBeInTheDocument();
  expect(screen.getByText(/No request has been created\./)).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Submit request" })).not.toBeInTheDocument();
  expect(screen.getByText("corr-2")).toBeInTheDocument();
});
