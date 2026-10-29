import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LowStockSummary } from "@/components/LowStockSummary";

const products = [
  { id: 1, name: "Keyboard", sku: "KEY-1", quantity: 0, threshold: 2 },
  { id: 2, name: "Mouse", sku: "MOUSE-2", quantity: 1, threshold: 3 },
  { id: 3, name: "Monitor", sku: "MON-3", quantity: 2, threshold: 2 },
];

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
afterEach(() => {
  if (originalShowModal) {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShowModal);
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  }
});

// jsdom does not implement the browser's modal lifecycle.
function mockShowModal() {
  const showModal = vi.fn(
    function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  );
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: showModal,
  });
  return showModal;
}

test("opens the product list while keeping the summary visible", async () => {
  const user = userEvent.setup();
  const showModal = mockShowModal();
  render(<LowStockSummary value={3} products={products} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Show low-stock list" });
  expect(button).toHaveAttribute("aria-haspopup", "dialog");
  await user.click(button);

  const dialog = screen.getByRole("dialog", { name: "Low-stock list" });
  expect(showModal).toHaveBeenCalledOnce();
  expect(dialog).toBeVisible();
  expect(button).toHaveAttribute("aria-controls", dialog.id);
  expect(screen.getByRole("heading", { name: "Low-stock products" })).toBeVisible();

  for (const product of products) {
    const link = within(dialog).getByRole("link", { name: product.name });
    expect(link).toHaveAttribute("href", "/products/" + product.id);
    const row = within(link.closest("tr")!);
    expect(row.getByText(product.sku)).toBeVisible();
    expect(row.getAllByRole("cell")[1]).toHaveTextContent(
      product.quantity === 0 ? "Out of stock" : String(product.quantity),
    );
    expect(row.getAllByRole("cell")[2]).toHaveTextContent(String(product.threshold));
  }

  const close = within(dialog).getByRole("button", { name: "Close" });
  expect(close.closest("form")).toHaveAttribute("method", "dialog");
});

test("shows an empty message when there are no low-stock products", async () => {
  mockShowModal();
  render(<LowStockSummary value={0} products={[]} />);
  await userEvent.click(screen.getByRole("button", { name: "Show low-stock list" }));

  const dialog = screen.getByRole("dialog", { name: "Low-stock list" });
  expect(within(dialog).getByText("No low-stock products.")).toBeVisible();
  expect(within(dialog).queryByRole("table")).not.toBeInTheDocument();
});

test.each([0, 3])("displays the supplied low-stock count %s", (value) => {
  render(<LowStockSummary value={value} products={products.slice(0, value)} />);
  expect(screen.getByText(String(value), { selector: "span" })).toBeVisible();
  expect(screen.getByText(
    "Active products at or below their threshold, including out-of-stock products.",
  )).toBeVisible();
});
