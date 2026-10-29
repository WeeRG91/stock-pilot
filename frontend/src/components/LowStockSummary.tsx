"use client";

import { useRef } from "react";
import type { LowStockProduct } from "@/types/dashboard";
import Link from "next/link";

type LowStockSummaryProps = {
  value: number;
  products: LowStockProduct[];
};

export function LowStockSummary({ value, products }: LowStockSummaryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <section className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Stock watch
        </p>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls="low-stock-list"
          onClick={() => dialogRef.current?.showModal()}
          className="rounded-full px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          Show low-stock list
        </button>
      </div>

      <div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-semibold tabular-nums ${
              value > 0
                ? "bg-accent-soft text-accent"
                : "bg-success-soft text-success"
            }`}
          >
            {value.toLocaleString("en-GB")}
          </span>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Low-stock products
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Active products at or below their threshold, including
              out-of-stock products.
            </p>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id="low-stock-list"
        aria-labelledby="low-stock-list-title"
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border border-line bg-surface p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="low-stock-list-title" className="text-xl font-semibold">
            Low-stock list
          </h2>

          <form method="dialog">
            <button
              autoFocus
              className="rounded-full px-3 py-2 text-sm font-medium text-accent hover:bg-accent-soft"
            >
              Close
            </button>
          </form>
        </div>

        {products.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No low-stock products.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th scope="col" className="pb-3 pr-4">
                    Product
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right">
                    In stock
                  </th>
                  <th scope="col" className="pb-3 text-right">
                    Threshold
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">{product.sku}</p>
                    </td>

                    <td className="py-4 pr-4 text-right tabular-nums">
                      {product.quantity === 0
                        ? "Out of stock"
                        : product.quantity.toLocaleString("en-GB")}
                    </td>

                    <td className="py-4 text-right tabular-nums">
                      {product.threshold.toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </dialog>
    </section>
  );
}
