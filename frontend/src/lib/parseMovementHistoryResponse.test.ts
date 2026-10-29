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
    meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  };

  expect(parseMovementHistoryResponse(payload)).toEqual(payload);
});

test("accepts empty history", () => {
  const payload = {
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  };

  expect(parseMovementHistoryResponse(payload)).toEqual(payload);
});

test.each([
  { description: "null", payload: null },
  { description: "missing data", payload: { meta: { page: 1, limit: 20, total: 2, totalPages: 1 } } },
  {
    description: "non-array data",
    payload: { data: movement, meta: { page: 1, limit: 20, total: 2, totalPages: 1 } },
  },
  {
    description: "missing metadata",
    payload: { data: [] },
  },
  {
    description: "a limit above the maximum",
    payload: { data: [], meta: { page: 1, limit: 101, total: 0, totalPages: 0 } },
  },
  {
    description: "too many movements",
    payload: {
      data: Array.from({ length: 21 }, (_, index) => ({
        ...movement,
        id: index + 1,
      })),
      meta: { page: 1, limit: 20, total: 21, totalPages: 2 },
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
    meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  };

  expect(() => parseMovementHistoryResponse(payload)).toThrow(
    "Invalid movement history response.",
  );
});
test.each([
  { description: "a later page", data: [movement], meta: { page: 2, limit: 1, total: 2, totalPages: 2 } },
  { description: "the maximum page size", data: [movement], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } },
  { description: "a page beyond the last page", data: [], meta: { page: 4, limit: 20, total: 2, totalPages: 1 } },
])("accepts $description", ({ data, meta }) => {
  const payload = { data, meta };
  expect(parseMovementHistoryResponse(payload)).toEqual(payload);
});

test.each([
  { page: undefined }, { page: 0 }, { page: 1.5 }, { page: "1" },
  { page: Number.MAX_SAFE_INTEGER + 1 },
  { limit: undefined }, { limit: 0 }, { limit: 101 }, { limit: 1.5 },
  { total: undefined }, { total: -1 }, { total: "2" },
  { totalPages: undefined }, { totalPages: -1 }, { totalPages: 2 },
])("rejects invalid pagination metadata %j", (changes) => {
  expect(() => parseMovementHistoryResponse({
    data: [movement],
    meta: { page: 1, limit: 20, total: 2, totalPages: 1, ...changes },
  })).toThrow("Invalid movement history response.");
});

test("rejects a list longer than the reported total", () => {
  expect(() => parseMovementHistoryResponse({
    data: [movement],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  })).toThrow("Invalid movement history response.");
});
