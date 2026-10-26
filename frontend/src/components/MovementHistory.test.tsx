import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { MovementHistory } from "./MovementHistory";

test("shows an empty state when no movements exist", () => {
  render(<MovementHistory movements={[]} />);

  expect(
    screen.getByText("No stock movements recorded."),
  ).toBeVisible();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("displays movement directions, quantities, and timestamps", () => {
  render(
    <MovementHistory
      movements={[
        {
          id: 2,
          productId: 2,
          type: "in",
          quantity: 5,
          createdAt: "2026-10-26T16:00:00+00:00",
        },
        {
          id: 1,
          productId: 2,
          type: "out",
          quantity: 2,
          createdAt: "2026-10-26T15:00:00+00:00",
        },
      ]}
    />,
  );

  const table = screen.getByRole("table", {
    name: "Recent stock movements",
  });
  const rows = within(table).getAllByRole("row");

  expect(rows).toHaveLength(3);

  expect(within(rows[1]).getByText("Stock in")).toBeVisible();
  expect(within(rows[1]).getByText("+5")).toBeVisible();

  expect(within(rows[2]).getByText("Stock out")).toBeVisible();
  expect(within(rows[2]).getByText("−2")).toBeVisible();

  expect(rows[1].querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-10-26T16:00:00+00:00",
  );
  expect(rows[2].querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-10-26T15:00:00+00:00",
  );

  expect(screen.getByText(/Dates are shown in UTC/)).toBeVisible();
});