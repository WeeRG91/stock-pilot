import { notFound } from "next/navigation";
import { StockMovementForm } from "@/components/StockMovementForm";
import { getProduct } from "@/lib/getProduct.server";
import { recordStockIn } from "./action";
import { FormPage } from "@/components/FormPage";

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
    <FormPage
      title="Record stock in"
      eyebrow="Receive inventory"
      backHref={`/products/${product.id}`}
      backLabel="Back to product"
      description={`${product.name} — ${product.sku}`}
    >
      {product.active ? (
        <StockMovementForm
          key={product.id}
          direction="in"
          action={recordStockInForProduct}
        />
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm leading-6 text-muted">
          This product is inactive. Activate it before recording stock.
        </p>
      )}
    </FormPage>
  );
}
