import { expect, test } from "vitest";
import { parseStockInResponse } from "./parseStockInResponse";

const movement = {
  id: 1,
  productId: 2,
  type: "in",
  quantity: 10,
  createdAt: "2026-10-26T15:35:49+00:00",
};

test("accepts a valid stock-in response", () => {
  const payload = { data: movement };

  expect(parseStockInResponse(payload)).toEqual(payload);
});

test.each([
  { description: "null", payload: null },
  { description: "an array", payload: [] },
  { description: "missing data", payload: {} },
  { description: "null data", payload: { data: null } },
  { description: "array data", payload: { data: [movement] } },
])("rejects $description", ({ payload }) => {
  expect(() => parseStockInResponse(payload)).toThrow(
    "Invalid stock-in response.",
  );
});

test.each([
  { description: "a string movement ID", changes: { id: "1" } },
  { description: "a zero movement ID", changes: { id: 0 } },
  { description: "a negative product ID", changes: { productId: -1 } },
  { description: "a stock-out type", changes: { type: "out" } },
  { description: "a string quantity", changes: { quantity: "10" } },
  { description: "a zero quantity", changes: { quantity: 0 } },
  { description: "a fractional quantity", changes: { quantity: 1.5 } },
  {
    description: "a quantity above the database maximum",
    changes: { quantity: 2147483648 },
  },
  {
    description: "an invalid timestamp",
    changes: { createdAt: "not-a-date" },
  },
  {
    description: "a non-string timestamp",
    changes: { createdAt: 123 },
  },
])("rejects $description", ({ changes }) => {
  const payload = {
    data: {
      ...movement,
      ...changes,
    },
  };

  expect(() => parseStockInResponse(payload)).toThrow(
    "Invalid stock-in response.",
  );
});