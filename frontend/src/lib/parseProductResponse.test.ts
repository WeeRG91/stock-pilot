import { expect, test } from "vitest";
import { parseProductResponse } from "@/lib/parseProductResponse";

const product = {
  id: 1,
  name: "Wireless Mouse",
  sku: "MOUSE-001",
  active: true,
};

test("accepts a valid product response", () => {
  const payload = { data: product };

  expect(parseProductResponse(payload)).toEqual(payload);
});

test("accepts an inactive product", () => {
  const payload = {
    data: { ...product, active: false },
  };

  expect(parseProductResponse(payload)).toEqual(payload);
});

test.each(
  [
    null,
    [],
    {},
    { data: null },
    { data: [product] },
    { data: { ...product, id: "1" } },
    { data: { ...product, id: 0 } },
    { data: { ...product, active: "true" } },
  ].map((payload) => ({ payload })),
)("rejects an invalid product response: $payload", ({ payload }) => {
  expect(() => parseProductResponse(payload)).toThrow(
    "Invalid product response.",
  );
});