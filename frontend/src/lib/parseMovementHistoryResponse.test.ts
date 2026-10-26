import { expect, test } from "vitest";
import { parseMovementHistoryResponse } from "./parseMovementHistoryResponse";

const movement = {
  id: 2,
  productId: 2,
  type: "in",
  quantity: 5,
  createdAt: "2026-10-26T16:00:00+00:00",
};

test("accepts stock-in and stock-out history", () => {
  const payload = {
    data: [
      movement,
      { ...movement, id: 1, type: "out", quantity: 2 },
    ],
    meta: { limit: 20 },
  };

  expect(parseMovementHistoryResponse(payload)).toEqual(payload);
});

test("accepts empty history", () => {
  const payload = {
    data: [],
    meta: { limit: 20 },
  };

  expect(parseMovementHistoryResponse(payload)).toEqual(payload);
});

test.each([
  { description: "null", payload: null },
  { description: "missing data", payload: { meta: { limit: 20 } } },
  {
    description: "non-array data",
    payload: { data: movement, meta: { limit: 20 } },
  },
  {
    description: "missing metadata",
    payload: { data: [] },
  },
  {
    description: "an unexpected limit",
    payload: { data: [], meta: { limit: 100 } },
  },
  {
    description: "too many movements",
    payload: {
      data: Array.from({ length: 21 }, (_, index) => ({
        ...movement,
        id: index + 1,
      })),
      meta: { limit: 20 },
    },
  },
])("rejects $description", ({ payload }) => {
  expect(() => parseMovementHistoryResponse(payload)).toThrow(
    "Invalid movement history response.",
  );
});

test.each([
  { description: "an invalid ID", changes: { id: 0 } },
  { description: "an invalid product ID", changes: { productId: -1 } },
  { description: "an unknown type", changes: { type: "adjustment" } },
  { description: "a string quantity", changes: { quantity: "5" } },
  { description: "a zero quantity", changes: { quantity: 0 } },
  { description: "a fractional quantity", changes: { quantity: 1.5 } },
  {
    description: "an oversized quantity",
    changes: { quantity: 2147483648 },
  },
  {
    description: "an invalid timestamp",
    changes: { createdAt: "not-a-date" },
  },
])("rejects a movement with $description", ({ changes }) => {
  const payload = {
    data: [{ ...movement, ...changes }],
    meta: { limit: 20 },
  };

  expect(() => parseMovementHistoryResponse(payload)).toThrow(
    "Invalid movement history response.",
  );
});