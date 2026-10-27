import Link from "next/link";
import { notFound } from "next/navigation";
import { StockMovementForm } from "@/components/StockMovementForm";
import { getProduct } from "@/lib/getProduct.server";
import { getProductStock } from "@/lib/getProductStock.server";
import { recordStockOut } from "./action";

export default async function StockOutPage({
  params,
}: PageProps<"/products/[id]/stock-out">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  const currentStock = await getProductStock(product.id);
  const recordStockOutForProduct = recordStockOut.bind(null, product.id);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/products/${product.id}`}
          className="text-zinc-700 underline"
        >
          Back to product
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          Record stock out
        </h1>

        <p className="mt-3 text-zinc-700">
          {product.name} — {product.sku}
        </p>

        <p className="mt-3 text-zinc-700">
          Available when this page loaded:{" "}
          {currentStock.toLocaleString("en-GB")} units.
          Availability is checked again when submitting.
        </p>

        {!product.active ? (
          <p className="mt-6 text-zinc-700">
            This product is inactive. Activate it before issuing stock.
          </p>
        ) : currentStock === 0 ? (
          <p className="mt-6 text-zinc-700">
            No stock is currently available to issue.
          </p>
        ) : (
          <StockMovementForm
            key={product.id}
            direction="out"
            action={recordStockOutForProduct}
          />
        )}
      </div>
    </main>
  );
}