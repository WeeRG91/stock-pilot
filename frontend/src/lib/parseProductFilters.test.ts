import { expect, test } from "vitest";
import { parseProductFilters } from "@/lib/parseProductFilters";

test("defaults to an empty search and all statuses", () => {
  expect(parseProductFilters({})).toEqual({
    success: true,
    search: "",
    active: "",
    page: 1,
    limit: 20,
  });
});

test("trims the search while preserving its case", () => {
  expect(parseProductFilters({ search: "  MOUSE  " })).toEqual({
    success: true,
    search: "MOUSE",
    active: "",
    page: 1,
    limit: 20,
  });
});

test.each(["", "true", "false"])("accepts the status value %j", (active) => {
  expect(parseProductFilters({ active })).toEqual({
    success: true,
    search: "",
    active,
    page: 1,
    limit: 20,
  });
});

test("rejects repeated search parameters", () => {
  expect(parseProductFilters({ search: ["mouse", "keyboard"] })).toEqual({
    success: false,
    message: "Provide only one search parameter.",
  });
});

test("rejects an unsupported status", () => {
  expect(parseProductFilters({ active: "invalid" })).toEqual({
    success: false,
    message: "Status must be true, false, or empty.",
  });
});

test("rejects repeated status parameters", () => {
  expect(parseProductFilters({ active: ["true", "false"] })).toEqual({
    success: false,
    message: "Status must be true, false, or empty.",
  });
});

test("parses pagination while preserving filters", () => {
  expect(
    parseProductFilters({
      search: " mouse ",
      active: "false",
      page: "2",
      limit: "1",
    }),
  ).toEqual({
    success: true,
    search: "mouse",
    active: "false",
    page: 2,
    limit: 1,
  });
});

test("accepts the maximum page size", () => {
  expect(parseProductFilters({ limit: "100" })).toEqual({
    success: true,
    search: "",
    active: "",
    page: 1,
    limit: 100,
  });
});

test.each([
  { page: "0" },
  { page: "-1" },
  { page: "1.5" },
  { page: "01" },
  { page: ["1", "2"] },
  { limit: "0" },
  { limit: ["10", "20"] },
])("rejects invalid pagination syntax: %j", (query) => {
  expect(parseProductFilters(query)).toEqual({
    success: false,
    message: "Page and limit must be positive whole numbers.",
  });
});

test.each([
  { limit: "101" },
  { page: "9007199254740992" },
  { page: "9007199254740991", limit: "100" },
])("rejects pagination outside supported ranges: %j", (query) => {
  expect(parseProductFilters(query)).toEqual({
    success: false,
    message: "Pagination is out of range. Limit must not exceed 100.",
  });
});
