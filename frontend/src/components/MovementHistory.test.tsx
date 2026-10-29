import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { MovementHistory } from "./MovementHistory";

test("shows an empty state when no movements exist", () => {
  render(<MovementHistory productId={2} movements={[]} meta={{ page: 1, limit: 20, total: 0, totalPages: 0 }} />);

  expect(
    screen.getByText("No stock movements recorded."),
  ).toBeVisible();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("displays movement directions, quantities, and timestamps", () => {
  render(
    <MovementHistory
      productId={2}
      meta={{ page: 1, limit: 20, total: 2, totalPages: 1 }}
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
test.each([
  { page: 1, previous: null, next: 2 },
  { page: 2, previous: 1, next: 3 },
  { page: 3, previous: 2, next: null },
])("shows the correct navigation on page $page", ({ page, previous, next }) => {
  render(<MovementHistory productId={7} movements={[
    { id: 1, productId: 7, type: "in", quantity: 5, createdAt: "2026-10-26T16:00:00+00:00" },
  ]} meta={{ page, limit: 1, total: 3, totalPages: 3 }} />);
  const nav = within(screen.getByRole("navigation", { name: "Movement history pagination" }));
  for (const [name, target] of [["Previous", previous], ["Next", next]] as const) {
    if (target === null) {
      expect(nav.queryByRole("link", { name })).not.toBeInTheDocument();
      expect(nav.getByText(name).closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
    } else {
      expect(nav.getByRole("link", { name })).toHaveAttribute("href", "/products/7?page=" + target + "&limit=1#movement-history");
    }
  }
  expect(screen.getByText("Showing 1 of 3 movements")).toBeVisible();
  expect(screen.getByText("Requested page " + page + " · 3 total pages")).toBeVisible();
});

test("disables both links when history is empty", () => {
  render(<MovementHistory productId={2} movements={[]} meta={{ page: 1, limit: 20, total: 0, totalPages: 0 }} />);
  const nav = screen.getByRole("navigation", { name: "Movement history pagination" });
  expect(within(nav).queryAllByRole("link")).toHaveLength(0);
  expect(nav.querySelectorAll('[aria-disabled="true"]')).toHaveLength(2);
});

test("lets an out-of-range page return to the last available page", () => {
  render(<MovementHistory productId={2} movements={[]} meta={{ page: 8, limit: 20, total: 21, totalPages: 2 }} />);
  expect(screen.getByText("No movements on this page.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/products/2?page=2&limit=20#movement-history");
  expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
});
