import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { GatewayAction, GatewayPostAction } from "./GatewayAction";

test("announces redirect progress and prevents duplicate activation", () => {
  render(
    <GatewayAction
      dataTestId="gateway-action"
      href="#target"
      label="Sign in"
      pendingLabel="Opening secure sign in..."
    />
  );

  const action = screen.getByTestId("gateway-action");
  fireEvent.click(action);

  expect(action).toHaveAttribute("aria-busy", "true");
  expect(action).toHaveAttribute("aria-disabled", "true");
  expect(action).toHaveTextContent("Opening secure sign in...");

  const duplicateClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  action.dispatchEvent(duplicateClick);
  expect(duplicateClick.defaultPrevented).toBe(true);
});

test("announces POST progress and disables duplicate submission", () => {
  render(
    <GatewayPostAction
      action="/auth/api/auth/sign-out"
      dataTestId="post-action"
      label="Sign out"
      pendingLabel="Signing out..."
    />
  );

  const action = screen.getByTestId("post-action");
  fireEvent.submit(action.closest("form") as HTMLFormElement);

  expect(action).toBeDisabled();
  expect(action).toHaveAttribute("aria-busy", "true");
  expect(action).toHaveTextContent("Signing out...");
});
