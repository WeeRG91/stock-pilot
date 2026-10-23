type ProductQuery = Record<string, string | string[] | undefined>;

type ProductFilterResult =
  | {
      success: true;
      search: string;
      active: "" | "true" | "false";
      page: number;
      limit: number;
    }
  | {
      success: false;
      message: string;
    };

export function parseProductFilters(query: ProductQuery): ProductFilterResult {
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

  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";

  if (
    typeof pageValue !== "string" ||
    typeof limitValue !== "string" ||
    !/^[1-9]\d*$/.test(pageValue) ||
    !/^[1-9]\d*$/.test(limitValue)
  ) {
    return {
      success: false,
      message: "Page and limit must be positive whole numbers.",
    };
  }

  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    return {
      success: false,
      message: "Pagination is out of range. Limit must not exceed 100.",
    };
  }

  return {
    success: true,
    search,
    active,
    page,
    limit,
  };
}
