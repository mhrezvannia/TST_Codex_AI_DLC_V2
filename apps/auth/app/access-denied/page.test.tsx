import { render, screen } from "@testing-library/react";
import AccessDeniedPage from "./page";

test("renders safe access denied context", async () => {
  render(await AccessDeniedPage({
    searchParams: Promise.resolve({
      resource: "Reference Data",
      action: "create a reference",
      reasonCode: "DENY_NO_PERMISSION",
      correlationId: "corr-1"
    })
  }));
  expect(screen.getByRole("heading", { name: "You cannot create a reference" })).toBeInTheDocument();
  expect(screen.getByText(/corr-1/)).toBeInTheDocument();
  expect(screen.getByTestId("request-access-link")).toHaveAttribute(
    "href",
    "/auth/request-access?resource=Reference%20Data&action=create%20a%20reference&correlationId=corr-1"
  );
});

test("does not expose unverified denial context", async () => {
  render(await AccessDeniedPage({
    searchParams: Promise.resolve({
      resource: "<script>protected record</script>",
      action: "approve",
      reasonCode: "UNKNOWN_POLICY_DETAIL"
    })
  }));

  expect(screen.getByRole("heading", { name: "We could not verify this access decision" })).toBeInTheDocument();
  expect(screen.getByText("Protected resource: the requested workspace")).toBeInTheDocument();
  expect(screen.queryByTestId("request-access-link")).not.toBeInTheDocument();
  expect(screen.queryByText(/script/)).not.toBeInTheDocument();
});
