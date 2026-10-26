import Link from "next/link";
import { notFound } from "next/navigation";
import { StockInForm } from "@/components/StockInForm";
import { getProduct } from "@/lib/getProduct.server";
import { recordStockIn } from "./action";

export default async function StockInPage({
  params,
}: PageProps<"/products/[id]/stock-in">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  const recordStockInForProduct = recordStockIn.bind(null, product.id);

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
          Record stock in
        </h1>

        <p className="mt-3 text-zinc-700">
          {product.name} — {product.sku}
        </p>

        {product.active ? (
          <StockInForm
            key={product.id}
            action={recordStockInForProduct}
          />
        ) : (
          <p className="mt-6 text-zinc-700">
            This product is inactive. Activate it before recording stock.
          </p>
        )}
      </div>
    </main>
  );
}