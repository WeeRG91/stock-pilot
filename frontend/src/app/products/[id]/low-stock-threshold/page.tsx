import { notFound } from "next/navigation";
import { LowStockThresholdForm } from "@/components/LowStockThresholdForm";
import { getLowStockThreshold } from "@/lib/getLowStockThreshold.server";
import { getProduct } from "@/lib/getProduct.server";
import { saveLowStockThreshold } from "./action";
import { FormPage } from "@/components/FormPage";

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

  const saveThresholdForProduct = saveLowStockThreshold.bind(null, product.id);

  return (
    <FormPage
      title="Edit low-stock threshold"
      eyebrow="Stock watch settings"
      backHref={`/products/${product.id}`}
      backLabel="Back to product"
      description={`${product.name} — ${product.sku}`}
    >
      {!product.active && (
        <p className="mt-6 rounded-2xl bg-accent-soft px-5 py-4 text-sm leading-6 text-accent">
          This product is inactive. Its threshold is retained, but low-stock
          warnings apply only when it is active.
        </p>
      )}

      <LowStockThresholdForm
        key={product.id}
        initialThreshold={threshold}
        action={saveThresholdForProduct}
      />
    </FormPage>
  );
}
