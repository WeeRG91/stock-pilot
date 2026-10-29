import { getProduct } from "@/lib/getProduct.server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setProductActivation } from "./activation-actions";
import { ProductActivationControl } from "@/components/ProductActivationControl";
import { getProductStock } from "@/lib/getProductStock.server";
import { getProductMovements } from "@/lib/getProductMovements.server";
import { MovementHistory } from "@/components/MovementHistory";
import { getLowStockThreshold } from "@/lib/getLowStockThreshold.server";

export default async function ProductDetailsPage({
  params,
  searchParams,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";

  if (
    typeof pageValue !== "string" ||
    typeof limitValue !== "string" ||
    !/^[1-9]\d*$/.test(pageValue) ||
    !/^[1-9]\d*$/.test(limitValue)
  ) {
    notFound();
  }

  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  const [currentStock, movementHistory, threshold] = await Promise.all([
    getProductStock(product.id),
    getProductMovements(product.id, page, limit),
    getLowStockThreshold(product.id),
  ]);

  if (threshold === null) {
    notFound();
  }

  const isLowStock = product.active && currentStock <= threshold;

  const changeActivation = setProductActivation.bind(
    null,
    product.id,
    !product.active,
  );

  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full py-2 text-sm text-muted hover:text-accent"
        >
          <span aria-hidden="true">←</span> Back to products
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Product details
            </p>

            <h1 className="mt-3 wrap-break-word font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 font-mono text-sm text-muted">{product.sku}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-4 py-2 text-xs font-medium ${
                product.active
                  ? "bg-success-soft text-success"
                  : "bg-surface-muted text-muted"
              }`}
            >
              {product.active ? "Active" : "Inactive"}
            </span>

            {isLowStock && (
              <span className="rounded-full bg-danger/10 px-4 py-2 text-xs font-medium text-danger">
                {currentStock === 0 ? "Out of stock" : "Low stock"}
              </span>
            )}
          </div>
        </div>

        {query.stockIn === "recorded" && (
          <p
            role="status"
            className="mt-6 rounded-2xl bg-success-soft px-5 py-4 text-sm text-success"
          >
            Stock received successfully.
          </p>
        )}

        {query.stockOut === "recorded" && (
          <p
            role="status"
            className="mt-6 rounded-2xl bg-success-soft px-5 py-4 text-sm text-success"
          >
            Stock issued successfully.
          </p>
        )}

        {query.threshold === "updated" && (
          <p
            role="status"
            className="mt-6 rounded-2xl bg-success-soft px-5 py-4 text-sm text-success"
          >
            Low-stock threshold updated.
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section
            aria-labelledby="stock-balance-heading"
            className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
          >
            <h2
              id="stock-balance-heading"
              className="text-sm font-medium text-muted"
            >
              Current stock
            </h2>

            <p className="mt-5 text-6xl font-semibold tracking-tight text-foreground tabular-nums">
              {currentStock.toLocaleString("en-GB")}
              <span className="ml-3 text-base font-normal tracking-normal text-muted">
                units
              </span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {product.active && (
                <Link
                  href={`/products/${product.id}/stock-in`}
                  className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Record stock in
                </Link>
              )}

              {product.active && currentStock > 0 && (
                <Link
                  href={`/products/${product.id}/stock-out`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-5 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  Record stock out
                </Link>
              )}
            </div>

            {!product.active && (
              <p className="mt-5 text-sm leading-6 text-muted">
                Activate this product to record stock movements.
              </p>
            )}
          </section>

          <section
            aria-labelledby="product-record-heading"
            className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
          >
            <h2
              id="product-record-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Product record
            </h2>

            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Product ID</dt>
                <dd className="mt-2 font-medium text-foreground">
                  #{product.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">SKU</dt>
                <dd className="mt-2 break-all font-mono text-foreground">
                  {product.sku}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
              <Link
                href={`/products/${product.id}/edit`}
                className="rounded-full border border-line px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Edit product
              </Link>

              <Link
                href={`/products/${product.id}/low-stock-threshold`}
                className="rounded-full border border-line px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Edit low-stock threshold
              </Link>
            </div>

            <ProductActivationControl
              key={product.id}
              active={product.active}
              action={changeActivation}
            />
          </section>
        </div>

        <MovementHistory
          productId={product.id}
          movements={movementHistory.data}
          meta={movementHistory.meta}
        />
      </div>
    </main>
  );
}
