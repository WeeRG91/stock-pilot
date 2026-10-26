import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ProductForm } from "@/components/ProductForm";
import type { ProductFormState } from "@/types/productForm";

const initialValues = {
  name: "Wireless Mouse",
  sku: "MOUSE-001",
};

test("prefills the fields with existing product details", () => {
  const action = vi.fn(async (state: ProductFormState) => state);

  render(
    <ProductForm
      action={action}
      initialValues={initialValues}
      submitLabel="Save changes"
      pendingLabel="Saving…"
    />,
  );

  expect(screen.getByLabelText("Name")).toHaveValue("Wireless Mouse");
  expect(screen.getByLabelText("SKU")).toHaveValue("MOUSE-001");
  expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  expect(action).not.toHaveBeenCalled();
});

test("submits edited values and preserves them after an error", async () => {
  const user = userEvent.setup();

  const action = vi.fn<
    (
      previousState: ProductFormState,
      formData: FormData,
    ) => Promise<ProductFormState>
  >(async () => ({
    values: {
      name: "Updated Mouse",
      sku: "DUPLICATE-001",
    },
    fieldErrors: {
      sku: "A product with this SKU already exists.",
    },
    message: "Please correct the highlighted field.",
  }));

  render(
    <ProductForm
      action={action}
      initialValues={initialValues}
      submitLabel="Save changes"
      pendingLabel="Saving…"
    />,
  );

  const nameInput = screen.getByLabelText("Name");
  const skuInput = screen.getByLabelText("SKU");

  await user.clear(nameInput);
  await user.type(nameInput, "Updated Mouse");
  await user.clear(skuInput);
  await user.type(skuInput, "DUPLICATE-001");
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  expect(
    await screen.findByText("A product with this SKU already exists."),
  ).toBeVisible();

  expect(action).toHaveBeenCalledOnce();

  const submittedData = action.mock.calls[0][1];

  expect(submittedData.get("name")).toBe("Updated Mouse");
  expect(submittedData.get("sku")).toBe("DUPLICATE-001");
  expect(nameInput).toHaveValue("Updated Mouse");
  expect(skuInput).toHaveValue("DUPLICATE-001");
  expect(skuInput).toHaveAttribute("aria-invalid", "true");
});
