import Link from "next/link";
import { notFound } from "next/navigation";
import { LowStockThresholdForm } from "@/components/LowStockThresholdForm";
import { getLowStockThreshold } from "@/lib/getLowStockThreshold.server";
import { getProduct } from "@/lib/getProduct.server";
import { saveLowStockThreshold } from "./action";

export default async function LowStockThresholdPage({
  params,
}: PageProps<"/products/[id]/low-stock-threshold">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const [product, threshold] = await Promise.all([
    getProduct(id),
    getLowStockThreshold(Number(id)),
  ]);

  if (product === null || threshold === null) {
    notFound();
  }

  const saveThresholdForProduct = saveLowStockThreshold.bind(
    null,
    product.id,
  );

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
          Edit low-stock threshold
        </h1>

        <p className="mt-3 text-zinc-700">
          {product.name} — {product.sku}
        </p>

        {!product.active && (
          <p className="mt-3 text-zinc-600">
            This product is inactive. Its threshold is retained, but
            low-stock warnings apply only when it is active.
          </p>
        )}

        <LowStockThresholdForm
          key={product.id}
          initialThreshold={threshold}
          action={saveThresholdForProduct}
        />
      </div>
    </main>
  );
}