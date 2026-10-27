import { expect, test } from "vitest";
import { parseDashboardResponse } from "./parseDashboardResponse";

const movement = {
  id: 6,
  productId: 2,
  productName: "Ergonomic Keyboard Pro",
  productSku: "KEYBOARD-002",
  type: "out",
  quantity: 1,
  createdAt: "2026-10-27T11:37:03+00:00",
};

const validResponse = {
  data: {
    products: { total: 3, active: 3, inactive: 0, lowStock: 3},
    stock: { totalUnits: 3 },
    recentMovements: [movement],
  },
  meta: { recentMovementsLimit: 5 },
};

test("accepts a valid dashboard response", () => {
  expect(parseDashboardResponse(validResponse)).toEqual(validResponse);
});

test("accepts an empty inventory", () => {
  const payload = {
    data: {
      products: { total: 0, active: 0, inactive: 0, lowStock: 0 },
      stock: { totalUnits: 0 },
      recentMovements: [],
    },
    meta: { recentMovementsLimit: 5 },
  };

  expect(parseDashboardResponse(payload)).toEqual(payload);
});

test.each([
  {
    description: "null",
    payload: null,
  },
  {
    description: "missing data",
    payload: {},
  },
  {
    description: "negative product counts",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        products: { total: 3, active: 4, inactive: -1, lowStock: 0 },
      },
    },
  },
  {
    description: "inconsistent product counts",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        products: { total: 3, active: 2, inactive: 0, lowStock: 0 },
      },
    },
  },
  {
    description: "negative stock",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        stock: { totalUnits: -1 },
      },
    },
  },
  {
    description: "a flattened stock field",
    payload: {
      data: {
        products: validResponse.data.products,
        totalUnits: 3,
        recentMovements: [],
      },
      meta: validResponse.meta,
    },
  },
  {
    description: "a missing product name",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        recentMovements: [{ ...movement, productName: undefined }],
      },
    },
  },
  {
    description: "an invalid movement direction",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        recentMovements: [{ ...movement, type: "adjustment" }],
      },
    },
  },
  {
    description: "an unexpected history limit",
    payload: {
      ...validResponse,
      meta: { recentMovementsLimit: 20 },
    },
  },
  {
    description: "too many recent movements",
    payload: {
      ...validResponse,
      data: {
        ...validResponse.data,
        recentMovements: Array.from({ length: 6 }, (_, index) => ({
          ...movement,
          id: index + 1,
        })),
      },
    },
  },
])("rejects $description", ({ payload }) => {
  expect(() => parseDashboardResponse(payload)).toThrow(
    "Invalid dashboard response.",
  );
});

test.each([
  { description: "an undefined count", value: undefined },
  { description: "a negative count", value: -1 },
  { description: "a count exceeding active products", value: 4 },
])("rejects low-stock data with $description", ({ value }) => {
  const payload = {
    ...validResponse,
    data: {
      ...validResponse.data,
      products: {
        ...validResponse.data.products,
        lowStock: value,
      },
    },
  };

  expect(() => parseDashboardResponse(payload)).toThrow(
    "Invalid dashboard response.",
  );
});