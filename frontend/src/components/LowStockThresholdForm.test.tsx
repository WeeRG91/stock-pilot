import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LowStockThresholdForm } from "./LowStockThresholdForm";
import type {
  LowStockThresholdFormState,
} from "@/types/lowStockThreshold";

test.each([0, 5])("prefills the saved threshold %s", (threshold) => {
  const action = vi.fn(async () => ({
    values: { threshold: String(threshold) },
    fieldErrors: {},
    message: "",
  }));

  render(
    <LowStockThresholdForm
      initialThreshold={threshold}
      action={action}
    />,
  );

  expect(
    screen.getByRole("spinbutton", { name: "Low-stock threshold" }),
  ).toHaveValue(threshold);
  expect(action).not.toHaveBeenCalled();
});

test("submits edits and preserves them after an action error", async () => {
  const user = userEvent.setup();

  const action = vi.fn<
    (
      previousState: LowStockThresholdFormState,
      formData: FormData,
    ) => Promise<LowStockThresholdFormState>
  >(async () => ({
    values: { threshold: "2" },
    fieldErrors: { threshold: "Threshold was rejected." },
    message: "Please correct the highlighted field.",
  }));

  render(
    <LowStockThresholdForm initialThreshold={5} action={action} />,
  );

  const input = screen.getByRole("spinbutton", {
    name: "Low-stock threshold",
  });

  await user.clear(input);
  await user.type(input, "2");
  await user.click(
    screen.getByRole("button", { name: "Save threshold" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please correct the highlighted field.",
  );
  expect(action).toHaveBeenCalledOnce();
  expect(action.mock.calls[0][1].get("threshold")).toBe("2");
  expect(input).toHaveValue(2);
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByText("Threshold was rejected.")).toBeVisible();
});

test("disables the form while saving", async () => {
  const user = userEvent.setup();

  let finishAction!: (state: LowStockThresholdFormState) => void;

  const response = new Promise<LowStockThresholdFormState>((resolve) => {
    finishAction = resolve;
  });

  const action = vi.fn(() => response);

  render(
    <LowStockThresholdForm initialThreshold={5} action={action} />,
  );

  const input = screen.getByRole("spinbutton", {
    name: "Low-stock threshold",
  });

  await user.click(
    screen.getByRole("button", { name: "Save threshold" }),
  );

  expect(input).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Saving threshold…" }),
  ).toBeDisabled();

  await act(async () => {
    finishAction({
      values: { threshold: "5" },
      fieldErrors: {},
      message: "Threshold updates are unavailable.",
    });
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Threshold updates are unavailable.",
  );
  expect(input).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Save threshold" }),
  ).toBeEnabled();
});