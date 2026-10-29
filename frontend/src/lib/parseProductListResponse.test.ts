import { expect, test } from "vitest";
import { parseProductListResponse } from "@/lib/parseProductListResponse";

const product = {
  id: 1,
  name: "Wireless Mouse",
  sku: "MOUSE-001",
  active: true,
  lowStock: false,
};

const meta = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

test("accepts a valid product list", () => {
  const payload = { data: [product], meta };

  expect(parseProductListResponse(payload)).toEqual(payload);
});

test("accepts an active low-stock product", () => {
  const payload = {
    data: [{ ...product, lowStock: true }],
    meta,
  };

  expect(parseProductListResponse(payload)).toEqual(payload);
});

test("accepts an inactive product without a low-stock warning", () => {
  const payload = {
    data: [{ ...product, active: false }],
    meta,
  };

  expect(parseProductListResponse(payload)).toEqual(payload);
});

test.each([
  { description: "a missing field", changes: { lowStock: undefined } },
  { description: "a string value", changes: { lowStock: "true" } },
  { description: "a null value", changes: { lowStock: null } },
  {
    description: "a warning on an inactive product",
    changes: { active: false, lowStock: true },
  },
])("rejects low-stock data with $description", ({ changes }) => {
  const payload = {
    data: [{ ...product, ...changes }],
    meta,
  };

  expect(() => parseProductListResponse(payload)).toThrow(
    "Invalid product list data.",
  );
});

test("accepts an empty product list", () => {
  const payload = {
    data: [],
    meta: { ...meta, total: 0, totalPages: 0 },
  };

  expect(parseProductListResponse(payload)).toEqual(payload);
});

test("rejects a non-object response", () => {
  expect(() => parseProductListResponse(null)).toThrow(
    "Invalid product list response.",
  );
});

test("rejects an invalid product field", () => {
  const payload = {
    data: [{ ...product, active: "true" }],
    meta,
  };

  expect(() => parseProductListResponse(payload)).toThrow(
    "Invalid product list data.",
  );
});

test("rejects missing pagination metadata", () => {
  expect(() =>
    parseProductListResponse({ data: [product] }),
  ).toThrow("Invalid product pagination metadata.");
});

test("rejects a limit above the API maximum", () => {
  const payload = {
    data: [product],
    meta: { ...meta, limit: 101 },
  };

  expect(() => parseProductListResponse(payload)).toThrow(
    "Invalid product pagination metadata.",
  );
});
