import Link from "next/link";
import type { Product } from "@/types/product";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <h2 className="text-lg font-medium text-foreground">
          No products found.
        </h2>
        <p className="mt-2 text-sm text-muted">
          Try another search or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-145 text-left text-sm">
          <caption className="sr-only">Product catalog</caption>

          <thead className="border-b border-line bg-surface-muted/50 text-xs text-muted">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">
                Product
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                SKU
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Status
              </th>
              <th scope="col" className="px-6 py-4">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-surface-muted/30"
              >
                <td className="px-6 py-5">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>

                <td className="px-6 py-5 font-mono text-xs text-muted">
                  {product.sku}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      product.active
                        ? "bg-success-soft text-success"
                        : "bg-surface-muted text-muted"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`View ${product.name}`}
                    className="rounded-full px-3 py-2 text-xs font-medium text-accent hover:bg-accent-soft"
                  >
                    View <span aria-hidden="true">↗</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}