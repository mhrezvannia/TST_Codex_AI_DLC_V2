import { render, screen } from "@testing-library/react";
import RequestAccessPage from "./page";

test("renders request access form", async () => {
  render(await RequestAccessPage({ searchParams: Promise.resolve({ resource: "Reference Data", action: "create" }) }));
  expect(screen.getByRole("heading", { name: "Request access" })).toBeInTheDocument();
  expect(screen.getByTestId("request-access-message")).toBeInTheDocument();
  expect(screen.getByTestId("request-access-submit")).toHaveAttribute("type", "submit");
});
