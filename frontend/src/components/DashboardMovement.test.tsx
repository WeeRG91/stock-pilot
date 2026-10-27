import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { DashboardMovements } from "./DashboardMovement";

test("shows an empty state when no movements exist", () => {
  render(<DashboardMovements movements={[]} />);

  expect(
    screen.getByText("No stock movements recorded."),
  ).toBeVisible();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("shows product links, movement directions, and timestamps", () => {
  render(
    <DashboardMovements
      movements={[
        {
          id: 6,
          productId: 2,
          productName: "Ergonomic Keyboard Pro",
          productSku: "KEYBOARD-002",
          type: "out",
          quantity: 1,
          createdAt: "2026-10-27T11:37:03+00:00",
        },
        {
          id: 5,
          productId: 1,
          productName: "Wireless Mouse",
          productSku: "MOUSE-001",
          type: "in",
          quantity: 10,
          createdAt: "2026-10-27T10:00:00+00:00",
        },
      ]}
    />,
  );

  const table = screen.getByRole("table", {
    name: "Latest movements across all products",
  });
  const rows = within(table).getAllByRole("row");

  expect(rows).toHaveLength(3);

  expect(
    within(rows[1]).getByRole("link", {
      name: "Ergonomic Keyboard Pro",
    }),
  ).toHaveAttribute("href", "/products/2");
  expect(within(rows[1]).getByText("KEYBOARD-002")).toBeVisible();
  expect(within(rows[1]).getByText("Stock out")).toBeVisible();
  expect(within(rows[1]).getByText("−1")).toBeVisible();

  expect(
    within(rows[2]).getByRole("link", { name: "Wireless Mouse" }),
  ).toHaveAttribute("href", "/products/1");
  expect(within(rows[2]).getByText("Stock in")).toBeVisible();
  expect(within(rows[2]).getByText("+10")).toBeVisible();

  expect(rows[1].querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-10-27T11:37:03+00:00",
  );
  expect(screen.getByText(/Dates are UTC/)).toBeVisible();
});