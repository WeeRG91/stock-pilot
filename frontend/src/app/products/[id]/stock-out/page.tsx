import { notFound } from "next/navigation";
import { StockMovementForm } from "@/components/StockMovementForm";
import { getProduct } from "@/lib/getProduct.server";
import { getProductStock } from "@/lib/getProductStock.server";
import { recordStockOut } from "./action";
import { FormPage } from "@/components/FormPage";

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
    <FormPage
      title="Record stock out"
      eyebrow="Issue inventory"
      backHref={`/products/${product.id}`}
      backLabel="Back to product"
      description={`${product.name} — ${product.sku}`}
    >
      <div className="mt-6 rounded-2xl border border-line bg-success-soft px-5 py-4 text-sm leading-6 text-success">
        Available when this page loaded:{" "}
        <strong>{currentStock.toLocaleString("en-GB")} units.</strong>{" "}
        Availability is checked again when submitting.
      </div>

      {!product.active ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          This product is inactive. Activate it before issuing stock.
        </p>
      ) : currentStock === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          No stock is currently available to issue.
        </p>
      ) : (
        <StockMovementForm
          key={product.id}
          direction="out"
          action={recordStockOutForProduct}
        />
      )}
    </FormPage>
  );
}
