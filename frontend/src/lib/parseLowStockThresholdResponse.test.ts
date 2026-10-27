import { expect, test } from "vitest";
import { parseLowStockThresholdResponse } from "./parseLowStockThresholdResponse";

test.each([0, 5, 2147483647])(
  "accepts threshold %s",
  (threshold) => {
    const payload = {
      data: { productId: 2, threshold },
    };

    expect(parseLowStockThresholdResponse(payload)).toEqual(payload);
  },
);

test.each([
  { description: "null", payload: null },
  { description: "an array", payload: [] },
  { description: "missing data", payload: {} },
  { description: "null data", payload: { data: null } },
  {
    description: "a nonpositive product ID",
    payload: { data: { productId: 0, threshold: 5 } },
  },
  {
    description: "a string product ID",
    payload: { data: { productId: "2", threshold: 5 } },
  },
  {
    description: "a missing threshold",
    payload: { data: { productId: 2 } },
  },
  {
    description: "a string threshold",
    payload: { data: { productId: 2, threshold: "5" } },
  },
  {
    description: "a negative threshold",
    payload: { data: { productId: 2, threshold: -1 } },
  },
  {
    description: "a fractional threshold",
    payload: { data: { productId: 2, threshold: 1.5 } },
  },
  {
    description: "an oversized threshold",
    payload: { data: { productId: 2, threshold: 2147483648 } },
  },
])("rejects $description", ({ payload }) => {
  expect(() => parseLowStockThresholdResponse(payload)).toThrow(
    "Invalid low-stock threshold response.",
  );
});