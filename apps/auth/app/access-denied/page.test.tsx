import { render, screen } from "@testing-library/react";
import AccessDeniedPage from "./page";

test("renders safe access denied context", async () => {
  render(await AccessDeniedPage({ searchParams: Promise.resolve({ resource: "Reference Data", action: "create", correlationId: "corr-1" }) }));
  expect(screen.getByRole("heading", { name: "Access denied" })).toBeInTheDocument();
  expect(screen.getByText(/corr-1/)).toBeInTheDocument();
  expect(screen.getByTestId("request-access-link")).toHaveAttribute(
    "href",
    "/request-access?resource=Reference%20Data&action=create&correlationId=corr-1"
  );
});
