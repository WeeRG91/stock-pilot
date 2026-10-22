import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { ProductSearch } from "@/components/ProductSearch";

const productNames = [
  "Wireless Mouse",
  "Mechanical Keyboard",
  "USB-C Cable",
];

test("filters names regardless of case and surrounding whitespace", async () => {
  const user = userEvent.setup();

  render(<ProductSearch productNames={productNames} />);

  const input = screen.getByRole("searchbox", {
    name: "Search products",
  });

  expect(screen.getAllByRole("listitem")).toHaveLength(3);

  await user.type(input, "  KEYBOARD  ");

  expect(input).toHaveValue("  KEYBOARD  ");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByText("Mechanical Keyboard")).toBeVisible();
  expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("1 matching products");

  await user.clear(input);

  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.getByRole("status")).toHaveTextContent("3 matching products");
});

test("shows an empty state when no products match", async () => {
  const user = userEvent.setup();

  render(<ProductSearch productNames={productNames} />);

  await user.type(
    screen.getByRole("searchbox", { name: "Search products" }),
    "printer",
  );

  expect(
    screen.getByText("No products match your search."),
  ).toBeVisible();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("0 matching products");
});