import { expect, test } from "vitest";
import { readStockInFormData } from "./readStockInFormData";

test.each(["1", "10", "2147483647", " 10 "])(
  "accepts quantity %j and preserves the original text",
  (quantity) => {
    const formData = new FormData();
    formData.set("quantity", quantity);

    expect(readStockInFormData(formData)).toEqual({
      values: { quantity },
      fieldErrors: {},
      message: "",
    });
  },
);

test.each(["", "   ", "0", "-1", "1.5", "1e3", "01", "abc"])(
  "rejects invalid whole-number syntax %j",
  (quantity) => {
    const formData = new FormData();
    formData.set("quantity", quantity);

    expect(readStockInFormData(formData)).toEqual({
      values: { quantity },
      fieldErrors: {
        quantity: "Enter a positive whole number.",
      },
      message: "Please correct the highlighted field.",
    });
  },
);

test.each(["2147483648", "9007199254740992"])(
  "rejects an out-of-range quantity %j",
  (quantity) => {
    const formData = new FormData();
    formData.set("quantity", quantity);

    const result = readStockInFormData(formData);

    expect(result.values.quantity).toBe(quantity);
    expect(result.fieldErrors.quantity).toBe(
      "Quantity must not exceed 2147483647.",
    );
  },
);

test("rejects a missing quantity", () => {
  const result = readStockInFormData(new FormData());

  expect(result).toEqual({
    values: { quantity: "" },
    fieldErrors: {
      quantity: "Quantity must be provided as text.",
    },
    message: "Please correct the highlighted field.",
  });
});

test("rejects a file instead of quantity text", () => {
  const formData = new FormData();
  formData.set("quantity", new File(["10"], "quantity.txt"));

  expect(readStockInFormData(formData)).toEqual({
    values: { quantity: "" },
    fieldErrors: {
      quantity: "Quantity must be provided as text.",
    },
    message: "Please correct the highlighted field.",
  });
});