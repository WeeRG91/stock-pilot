import { expect, test } from "vitest";
import { buildProductsHref } from "@/lib/buildProductsHref";

test("includes pagination and omits empty filters", () => {
  const href = buildProductsHref({
    search: "",
    active: "",
    page: 2,
    limit: 20,
  });

  const url = new URL(href, "http://localhost");

  expect(url.pathname).toBe("/products");
  expect(url.searchParams.get("page")).toBe("2");
  expect(url.searchParams.get("limit")).toBe("20");
  expect(url.searchParams.has("search")).toBe(false);
  expect(url.searchParams.has("active")).toBe(false);
});

test("preserves search and inactive status", () => {
  const href = buildProductsHref({
    search: "keyboard",
    active: "false",
    page: 3,
    limit: 1,
  });

  const url = new URL(href, "http://localhost");

  expect(url.searchParams.get("search")).toBe("keyboard");
  expect(url.searchParams.get("active")).toBe("false");
  expect(url.searchParams.get("page")).toBe("3");
  expect(url.searchParams.get("limit")).toBe("1");
});

test("encodes search characters without introducing extra parameters", () => {
  const href = buildProductsHref({
    search: "Mouse & Cable + USB?",
    active: "true",
    page: 1,
    limit: 10,
  });

  const url = new URL(href, "http://localhost");

  expect(url.searchParams.get("search")).toBe("Mouse & Cable + USB?");
  expect(url.searchParams.get("active")).toBe("true");
  expect(Array.from(url.searchParams.keys()).sort()).toEqual([
    "active",
    "limit",
    "page",
    "search",
  ]);
});