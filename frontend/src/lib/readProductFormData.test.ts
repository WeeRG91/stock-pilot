import { expect, test } from "vitest";
import { readProductFormData } from "@/lib/readProductFormData";

test("accepts text fields and preserves their original values", () => {
  const formData = new FormData();
  formData.set("name", " Wireless Mouse ");
  formData.set("sku", " MOUSE-001 ");

  expect(readProductFormData(formData)).toEqual({
    values: {
      name: " Wireless Mouse ",
      sku: " MOUSE-001 ",
    },
    fieldErrors: {},
    message: "",
  });
});

test("rejects missing fields", () => {
  expect(readProductFormData(new FormData())).toEqual({
    values: { name: "", sku: "" },
    fieldErrors: {
      name: "Name must be provided as text.",
      sku: "SKU must be provided as text.",
    },
    message: "Please correct the highlighted fields.",
  });
});

test("rejects whitespace-only values", () => {
  const formData = new FormData();
  formData.set("name", "   ");
  formData.set("sku", "");

  const state = readProductFormData(formData);

  expect(state.fieldErrors).toEqual({
    name: "Name is required.",
    sku: "SKU is required.",
  });
  expect(state.message).toBe("Please correct the highlighted fields.");
});

test("rejects a file while preserving the valid text field", () => {
  const formData = new FormData();
  formData.set("name", new File(["example"], "product.txt"));
  formData.set("sku", "MOUSE-001");

  const state = readProductFormData(formData);

  expect(state.values).toEqual({
    name: "",
    sku: "MOUSE-001",
  });
  expect(state.fieldErrors).toEqual({
    name: "Name must be provided as text.",
  });
});