import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { StockInForm } from "./StockInForm";
import type { StockInFormState } from "@/types/stockInForm";

test("submits quantity and preserves it after an action error", async () => {
  const user = userEvent.setup();

  const action = vi.fn<
    (
      previousState: StockInFormState,
      formData: FormData,
    ) => Promise<StockInFormState>
  >(async () => ({
    values: { quantity: "5" },
    fieldErrors: {
      quantity: "Quantity was rejected.",
    },
    message: "Please correct the highlighted field.",
  }));

  render(<StockInForm action={action} />);

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

  let finishAction!: (state: StockInFormState) => void;

  const response = new Promise<StockInFormState>((resolve) => {
    finishAction = resolve;
  });

  const action = vi.fn(() => response);

  render(<StockInForm action={action} />);

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