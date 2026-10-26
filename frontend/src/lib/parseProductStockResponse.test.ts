import { expect, test } from "vitest";
import { parseProductStockResponse } from "./parseProductStockResponse";

test.each([0, 15, 2147483648])(
  "accepts a stock balance of %s",
  (quantity) => {
    const payload = {
      data: { productId: 2, quantity },
    };

    expect(parseProductStockResponse(payload)).toEqual(payload);
  },
);

test.each([
  { description: "null", payload: null },
  { description: "missing data", payload: {} },
  { description: "null data", payload: { data: null } },
  {
    description: "an invalid product ID",
    payload: { data: { productId: 0, quantity: 15 } },
  },
  {
    description: "a string quantity",
    payload: { data: { productId: 2, quantity: "15" } },
  },
  {
    description: "a negative balance",
    payload: { data: { productId: 2, quantity: -1 } },
  },
  {
    description: "a fractional balance",
    payload: { data: { productId: 2, quantity: 1.5 } },
  },
  {
    description: "an unsafe integer",
    payload: { data: { productId: 2, quantity: 9007199254740992 } },
  },
])("rejects $description", ({ payload }) => {
  expect(() => parseProductStockResponse(payload)).toThrow(
    "Invalid product stock response.",
  );
});