import { render, screen } from "@testing-library/react";
import AuthHomePage from "./page";

test("renders the auth shell", () => {
  render(<AuthHomePage />);
  expect(screen.getByRole("heading", { name: "Shared Platform Auth" })).toBeInTheDocument();
  expect(screen.getByTestId("auth-start-link")).toHaveAttribute("href", "/sign-in");
});
