import { parseProductListResponse } from "@/lib/parseProductListResponse";

export default async function ProductsPage() {
  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    throw new Error("STOCKPILOT_API_URL is not configured.");
  }

  const response = await fetch(new URL("/api/products", apiUrl), {
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

        <p className="mt-2 text-zinc-600">
          Showing {result.data.length} of {result.meta.total} products.
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
      </div>
    </main>
  );
}
