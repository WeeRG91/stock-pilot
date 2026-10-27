import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { StockMovementForm } from "./StockMovementForm";
import type { StockMovementFormState } from "@/types/stockMovementForm";

test("submits quantity and preserves it after an action error", async () => {
  const user = userEvent.setup();

  const action = vi.fn<
    (
      previousState: StockMovementFormState,
      formData: FormData,
    ) => Promise<StockMovementFormState>
  >(async () => ({
    values: { quantity: "5" },
    fieldErrors: {
      quantity: "Quantity was rejected.",
    },
    message: "Please correct the highlighted field.",
  }));

  render(<StockMovementForm direction="in" action={action} />);

  const input = screen.getByRole("spinbutton", {
    name: "Quantity received",
  });

  await user.type(input, "5");
  await user.click(
    screen.getByRole("button", { name: "Record stock in" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please correct the highlighted field.",
  );
  expect(action).toHaveBeenCalledOnce();

  const submittedForm = action.mock.calls[0][1];

  expect(submittedForm.get("quantity")).toBe("5");
  expect(input).toHaveValue(5);
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByText("Quantity was rejected.")).toBeVisible();
});

test("disables the form while recording stock", async () => {
  const user = userEvent.setup();

  let finishAction!: (state: StockMovementFormState) => void;

  const response = new Promise<StockMovementFormState>((resolve) => {
    finishAction = resolve;
  });

  const action = vi.fn(() => response);

  render(<StockMovementForm direction="in" action={action} />);

  const input = screen.getByRole("spinbutton", {
    name: "Quantity received",
  });

  await user.type(input, "5");
  await user.click(
    screen.getByRole("button", { name: "Record stock in" }),
  );

  expect(input).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Recording stock…" }),
  ).toBeDisabled();

  await act(async () => {
    finishAction({
      values: { quantity: "5" },
      fieldErrors: {},
      message: "Stock recording could not be confirmed.",
    });
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Stock recording could not be confirmed.",
  );
  expect(input).toBeEnabled();
  expect(input).toHaveValue(5);
  expect(
    screen.getByRole("button", { name: "Record stock in" }),
  ).toBeEnabled();
});

test("submits stock-out quantity and preserves insufficient-stock feedback", async () => {
  const user = userEvent.setup();

  const action = vi.fn<
    (
      previousState: StockMovementFormState,
      formData: FormData,
    ) => Promise<StockMovementFormState>
  >(async () => ({
    values: { quantity: "5" },
    fieldErrors: {
      quantity: "Not enough stock. Reload to check the current balance.",
    },
    message: "Stock was not issued.",
  }));

  render(<StockMovementForm direction="out" action={action} />);

  expect(
    screen.getByRole("group", { name: "Stock issued" }),
  ).toBeVisible();

  const input = screen.getByRole("spinbutton", {
    name: "Quantity to issue",
  });

  await user.type(input, "5");
  await user.click(
    screen.getByRole("button", { name: "Record stock out" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Stock was not issued.",
  );
  expect(
    screen.getByText(
      "Not enough stock. Reload to check the current balance.",
    ),
  ).toBeVisible();

  expect(action).toHaveBeenCalledOnce();
  expect(action.mock.calls[0][1].get("quantity")).toBe("5");
  expect(input).toHaveValue(5);
  expect(input).toHaveAttribute("aria-invalid", "true");
});