import { buildProductsHref } from "@/lib/buildProductsHref";
import { parseProductFilters } from "@/lib/parseProductFilters";
import { parseProductListResponse } from "@/lib/parseProductListResponse";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const filters = parseProductFilters(await searchParams);

  if (!filters.success) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
          <p className="mt-4 text-zinc-600" role="alert">
            {filters.message}
          </p>
        </div>
      </main>
    );
  }

  const { search, active, page, limit } = filters;

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const url = new URL("/api/products", apiUrl);

  if (search !== "") {
    url.searchParams.set("search", search);
  }

  if (active !== "") {
    url.searchParams.set("active", active);
  }

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch products.");
  }

  const payload: unknown = await response.json();
  const result = parseProductListResponse(payload);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">Products</h1>

        <form
          key={JSON.stringify([search, active])}
          action="/products"
          method="get"
          className="mt-6 flex flex-wrap items-end gap-4"
        >
          <input type="hidden" name="limit" value={limit} />

          <div>
            <label
              htmlFor="product-filter-search"
              className="block text-sm font-medium text-zinc-700"
            >
              Search products
            </label>
            <input
              id="product-filter-search"
              name="search"
              type="search"
              defaultValue={search}
              className="mt-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
            />
          </div>

          <div>
            <label
              htmlFor="product-filter-status"
              className="block text-sm font-medium text-zinc-700"
            >
              Status
            </label>
            <select
              id="product-filter-status"
              name="active"
              defaultValue={active}
              className="mt-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
          >
            Apply filters
          </button>

          <Link href="/products" className="py-2 text-zinc-700 underline">
            Clear filters
          </Link>
        </form>

        <p className="mt-2 text-zinc-600">
          Showing {result.data.length} of {result.meta.total} products.
        </p>

        <p className="mt-1 text-sm text-zinc-600">
          Requested page: {result.meta.page}. Total pages:{" "}
          {result.meta.totalPages}.
        </p>

        {result.data.length === 0 ? (
          <p className="mt-6 text-zinc-600">No products found.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {result.data.map((product) => (
              <li
                key={product.id}
                className="rounded-xl border border-zinc-200 bg-white p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">SKU: {product.sku}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {product.active ? "Active" : "Inactive"}
                </p>
              </li>
            ))}
          </ul>
        )}

        <nav
          aria-label="Product pagination"
          className="mt-6 flex gap-6 text-zinc-700"
        >
          {result.meta.page > 1 && result.meta.totalPages > 0 && (
            <Link
              href={buildProductsHref({
                search,
                active,
                page: Math.min(result.meta.page - 1, result.meta.totalPages),
                limit,
              })}
              className="underline"
            >
              Previous
            </Link>
          )}

          {result.meta.page < result.meta.totalPages && (
            <Link
              href={buildProductsHref({
                search,
                active,
                page: result.meta.page + 1,
                limit,
              })}
              className="underline"
            >
              Next
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
