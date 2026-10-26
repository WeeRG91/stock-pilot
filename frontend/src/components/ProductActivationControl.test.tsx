import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ProductActivationControl } from "@/components/ProductActivationControl";
import type { ProductActivationState } from "@/types/productActivation";

test.each([
  { active: true, label: "Deactivate product" },
  { active: false, label: "Activate product" },
])("shows $label for active=$active", ({ active, label }) => {
  const action = vi.fn(async () => ({ error: "" }));

  render(<ProductActivationControl active={active} action={action} />);

  expect(screen.getByRole("button", { name: label })).toBeEnabled();
  expect(action).not.toHaveBeenCalled();
});

test("displays an action error without changing the requested operation", async () => {
  const user = userEvent.setup();
  const action = vi.fn(async () => ({
    error: "Status change could not be confirmed.",
  }));

  render(<ProductActivationControl active={true} action={action} />);

  await user.click(
    screen.getByRole("button", { name: "Deactivate product" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Status change could not be confirmed.",
  );
  expect(action).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("button", { name: "Deactivate product" }),
  ).toBeEnabled();
});

test("disables submission while the action is pending", async () => {
  const user = userEvent.setup();

  let finishAction!: (state: ProductActivationState) => void;

  const response = new Promise<ProductActivationState>((resolve) => {
    finishAction = resolve;
  });

  const action = vi.fn(() => response);

  render(<ProductActivationControl active={true} action={action} />);

  await user.click(
    screen.getByRole("button", { name: "Deactivate product" }),
  );

  expect(
    screen.getByRole("button", { name: "Updating status…" }),
  ).toBeDisabled();

  await act(async () => {
    finishAction({ error: "" });
  });

  expect(
    screen.getByRole("button", { name: "Deactivate product" }),
  ).toBeEnabled();
});