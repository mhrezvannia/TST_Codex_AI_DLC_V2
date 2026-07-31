import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import {
  AgreementLifecycleDialog,
  type AgreementLifecycleAction
} from "./AgreementLifecycleDialog";

test.each([
  ["approve", "Confirm Agreement approval", "Approval freezes this commercial version"],
  ["suspend", "Confirm Agreement suspension", "Suspension removes this approved version"],
  ["expire", "Confirm Agreement expiry", "Expiry is a terminal lifecycle transition"]
] as const)("shows %s evidence and consequence before confirmation", async (action, title, consequence) => {
  render(<Harness action={action} onConfirm={vi.fn().mockResolvedValue(undefined)} />);
  fireEvent.click(screen.getByRole("button", { name: `Open ${action}` }));

  expect(await screen.findByRole("dialog", { name: title })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(consequence))).toBeInTheDocument();
  expect(screen.getByText("AGR-1")).toBeInTheDocument();
  expect(screen.getByText("agreement-1")).toBeInTheDocument();
  expect(screen.getByText("v3 / version-3")).toBeInTheDocument();
  expect(screen.getByText("7")).toBeInTheDocument();
});

test("contains focus, closes with Escape, and restores the lifecycle trigger", async () => {
  render(<Harness action="approve" onConfirm={vi.fn().mockResolvedValue(undefined)} />);
  const trigger = screen.getByRole("button", { name: "Open approve" });
  fireEvent.click(trigger);

  const reason = await screen.findByLabelText("Reason");
  await waitFor(() => expect(reason).toHaveFocus());
  const confirm = screen.getByRole("button", { name: "Approve Agreement" });

  confirm.focus();
  fireEvent.keyDown(confirm, { key: "Tab" });
  expect(reason).toHaveFocus();

  fireEvent.keyDown(reason, { key: "Tab", shiftKey: true });
  expect(confirm).toHaveFocus();

  fireEvent.keyDown(reason, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test("requires a reason and prevents duplicate or dismissing actions while pending", async () => {
  let complete!: () => void;
  const onConfirm = vi.fn(() => new Promise<void>((resolve) => {
    complete = resolve;
  }));
  render(<Harness action="approve" onConfirm={onConfirm} />);
  const trigger = screen.getByRole("button", { name: "Open approve" });
  fireEvent.click(trigger);

  const confirm = await screen.findByRole("button", { name: "Approve Agreement" });
  fireEvent.click(confirm);
  const error = await screen.findByRole("alert");
  expect(error).toHaveTextContent("A reason is required");
  await waitFor(() => expect(error).toHaveFocus());
  expect(screen.getByLabelText("Reason")).toHaveAttribute("aria-invalid", "true");

  fireEvent.change(screen.getByLabelText("Reason"), {
    target: { value: "Approved against signed rate evidence" }
  });
  fireEvent.click(confirm);
  fireEvent.click(confirm);

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledWith("Approved against signed rate evidence");
  expect(screen.getByTestId("agreement-lifecycle-dialog")).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("status")).toHaveTextContent("pending. Do not submit again");

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  await act(async () => complete());
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

function Harness({
  action,
  onConfirm
}: {
  action: AgreementLifecycleAction;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
      Open {action}
    </button>
    {open ? <AgreementLifecycleDialog
      open
      action={action}
      agreementNumber="AGR-1"
      agreementId="agreement-1"
      versionNo={3}
      agreementVersionId="version-3"
      rowVersion={7}
      returnFocusTo={triggerRef.current}
      onClose={() => setOpen(false)}
      onConfirm={onConfirm}
    /> : null}
  </>;
}
