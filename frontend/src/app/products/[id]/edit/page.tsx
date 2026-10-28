import { notFound } from "next/navigation";
import { getProduct } from "@/lib/getProduct.server";
import { updateProduct } from "./action";
import { ProductForm } from "@/components/ProductForm";
import { FormPage } from "@/components/FormPage";

export default async function EditProductPage({
  params,
}: PageProps<"/products/[id]/edit">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <FormPage
      title={`Edit ${product.name}`}
      eyebrow="Product settings"
      backHref={`/products/${product.id}`}
      backLabel="Back to product"
      description="Keep your product name and SKU clear and up to date."
    >
      <ProductForm
        key={product.id}
        action={updateProductWithId}
        initialValues={{
          name: product.name,
          sku: product.sku,
        }}
        submitLabel="Save changes"
        pendingLabel="Saving..."
      />
    </FormPage>
  );
}
