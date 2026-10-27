import { expect, test } from "vitest";
import { parseStockOutResponse } from "./parseStockOutResponse";

const movement = {
  id: 3,
  productId: 2,
  type: "out",
  quantity: 4,
  createdAt: "2026-10-27T07:00:00+00:00",
};

test("accepts a valid stock-out response", () => {
  const payload = { data: movement };

  expect(parseStockOutResponse(payload)).toEqual(payload);
});

test.each([
  { description: "null", payload: null },
  { description: "an array", payload: [] },
  { description: "missing data", payload: {} },
  { description: "null data", payload: { data: null } },
  { description: "array data", payload: { data: [movement] } },
])("rejects $description", ({ payload }) => {
  expect(() => parseStockOutResponse(payload)).toThrow(
    "Invalid stock-out response.",
  );
});

test.each([
  { description: "a stock-in direction", changes: { type: "in" } },
  { description: "an unknown direction", changes: { type: "adjustment" } },
  { description: "a zero ID", changes: { id: 0 } },
  { description: "an invalid product ID", changes: { productId: -1 } },
  { description: "a string quantity", changes: { quantity: "4" } },
  { description: "a negative quantity", changes: { quantity: -4 } },
  { description: "a fractional quantity", changes: { quantity: 1.5 } },
  {
    description: "an oversized quantity",
    changes: { quantity: 2147483648 },
  },
  {
    description: "an invalid timestamp",
    changes: { createdAt: "not-a-date" },
  },
])("rejects $description", ({ changes }) => {
  const payload = {
    data: {
      ...movement,
      ...changes,
    },
  };

  expect(() => parseStockOutResponse(payload)).toThrow(
    "Invalid stock-out response.",
  );
});