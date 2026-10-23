type ProductPageOptions = {
  search: string;
  active: "" | "true" | "false";
  page: number;
  limit: number;
};

export function buildProductsHref({
  search,
  active,
  page,
  limit,
}: ProductPageOptions): string {
  const params = new URLSearchParams();

  if (search !== "") {
    params.set("search", search);
  }

  if (active !== "") {
    params.set("active", active);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return `/products?${params.toString()}`;
}