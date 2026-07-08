import { render, screen } from "@testing-library/react";
import SignInPage from "./page";

test("renders Keycloak sign-in action", async () => {
  render(await SignInPage({ searchParams: Promise.resolve({ returnUrl: "/session" }) }));
  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.getByTestId("sign-in-button")).toHaveAttribute("href", "/api/auth/sign-in?returnUrl=%2Fsession");
});
