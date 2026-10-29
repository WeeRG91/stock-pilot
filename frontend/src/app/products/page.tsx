import { InventoryExportForm } from "@/components/InventoryExportForm";
import { ProductTable } from "@/components/ProductTable";
import { buildProductsHref } from "@/lib/buildProductsHref";
import { getApiSessionHeaders } from "@/lib/getApiSessionHeaders.server";
import { parseProductFilters } from "@/lib/parseProductFilters";
import { parseProductListResponse } from "@/lib/parseProductListResponse";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const filters = parseProductFilters(await searchParams);

  if (!filters.success) {
    return (
      <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Products
          </h1>

          <div className="mt-6 rounded-3xl border border-line bg-surface p-6">
            <p className="text-sm text-danger" role="alert">
              {filters.message}
            </p>

            <Link
              href="/products"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Reset filters
            </Link>
          </div>
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

  const headers = await getApiSessionHeaders();

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    headers,
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch products.");
  }

  const payload: unknown = await response.json();
  const result = parseProductListResponse(payload);

  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Your catalog
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              Products
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Keep your products organized and your inventory moving.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <InventoryExportForm />

            <Link
              href="/inventory-exports"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Recent exports
            </Link>

            <Link
              href="/products/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:self-auto"
            >
              <span aria-hidden="true">+</span>
              Create product
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          CSV exports include all products and their current stock, regardless
          of the filters below.
        </p>

        <form
          key={JSON.stringify([search, active])}
          action="/products"
          method="get"
          className="mt-8 flex flex-wrap items-end gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6"
        >
          <input type="hidden" name="limit" value={limit} />

          <div className="min-w-0 flex-1 basis-56">
            <label
              htmlFor="product-filter-search"
              className="block text-xs font-medium text-muted"
            >
              Search products
            </label>
            <input
              id="product-filter-search"
              name="search"
              type="search"
              defaultValue={search}
              className="mt-2 min-h-11 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted"
            />
          </div>

          <div className="w-full sm:w-44">
            <label
              htmlFor="product-filter-status"
              className="block text-xs font-medium text-muted"
            >
              Status
            </label>
            <select
              id="product-filter-status"
              name="active"
              defaultValue={active}
              className="mt-2 min-h-11 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="min-h-11 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-accent"
          >
            Apply filters
          </button>

          <Link
            href="/products"
            className="rounded-full px-3 py-3 text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Clear filters
          </Link>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <p>
            Showing{" "}
            <span className="font-medium text-foreground">
              {result.data.length}
            </span>{" "}
            of {result.meta.total} products
          </p>

          <p>
            Requested page {result.meta.page} · {result.meta.totalPages} total
            pages
          </p>
        </div>

        <ProductTable products={result.data} />

        <nav
          aria-label="Product pagination"
          className="mt-6 flex items-center justify-between gap-4"
        >
          {result.meta.page > 1 && result.meta.totalPages > 0 ? (
            <Link
              href={buildProductsHref({
                search,
                active,
                page: Math.min(result.meta.page - 1, result.meta.totalPages),
                limit,
              })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              <span aria-hidden="true">←</span> Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-muted opacity-50"
            >
              <span aria-hidden="true">←</span> Previous
            </span>
          )}

          {result.meta.page < result.meta.totalPages ? (
            <Link
              href={buildProductsHref({
                search,
                active,
                page: result.meta.page + 1,
                limit,
              })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Next <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-muted opacity-50"
            >
              Next <span aria-hidden="true">→</span>
            </span>
          )}
        </nav>
      </div>
    </main>
  );
}
