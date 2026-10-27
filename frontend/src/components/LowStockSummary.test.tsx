import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { LowStockSummary } from "@/components/LowStockSummary";

test("allows the user to hide and show the low-stock summary", async () => {
  const user = userEvent.setup();

  render(<LowStockSummary value={3} />);

  const heading = screen.getByRole("heading", {
    name: "Low-stock products",
  });

  const button = screen.getByRole("button", {
    name: "Hide low-stock summary",
  });

  expect(heading).toBeVisible();
  expect(button).toHaveAttribute("aria-expanded", "true");

  await user.click(button);

  expect(heading).not.toBeVisible();
  expect(button).toHaveAccessibleName("Show low-stock summary");
  expect(button).toHaveAttribute("aria-expanded", "false");

  await user.click(button);

  expect(heading).toBeVisible();
  expect(button).toHaveAccessibleName("Hide low-stock summary");
  expect(button).toHaveAttribute("aria-expanded", "true");
});

test.each([0, 3])("displays the supplied low-stock count %s", (value) => {
  render(<LowStockSummary value={value} />);

  expect(screen.getByText(String(value))).toBeVisible();
  expect(
    screen.getByText(
      "Active products at or below their threshold, including out-of-stock products.",
    ),
  ).toBeVisible();
});