type ProductQuery = Record<string, string | string[] | undefined>;

type ProductFilterResult =
  | {
      success: true;
      search: string;
      active: "" | "true" | "false";
    }
  | {
      success: false;
      message: string;
    };

export function parseProductFilters(
  query: ProductQuery,
): ProductFilterResult {
  if (Array.isArray(query.search)) {
    return {
      success: false,
      message: "Provide only one search parameter.",
    };
  }

  const search = (query.search ?? "").trim();
  const active = query.active ?? "";

  if (active !== "" && active !== "true" && active !== "false") {
    return {
      success: false,
      message: "Status must be true, false, or empty.",
    };
  }

  return {
    success: true,
    search,
    active,
  };
}