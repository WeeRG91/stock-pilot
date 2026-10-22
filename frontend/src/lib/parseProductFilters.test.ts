import { expect, test } from "vitest";
import { parseProductFilters } from "@/lib/parseProductFilters";

test("defaults to an empty search and all statuses", () => {
  expect(parseProductFilters({})).toEqual({
    success: true,
    search: "",
    active: "",
  });
});

test("trims the search while preserving its case", () => {
  expect(parseProductFilters({ search: "  MOUSE  " })).toEqual({
    success: true,
    search: "MOUSE",
    active: "",
  });
});

test.each(["", "true", "false"])(
  "accepts the status value %j",
  (active) => {
    expect(parseProductFilters({ active })).toEqual({
      success: true,
      search: "",
      active,
    });
  },
);

test("rejects repeated search parameters", () => {
  expect(
    parseProductFilters({ search: ["mouse", "keyboard"] }),
  ).toEqual({
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