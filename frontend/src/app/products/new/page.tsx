import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "./action";
import { FormPage } from "@/components/FormPage";

export default function NewProductPage() {
  return (
    <FormPage
      title="Create product"
      eyebrow="Grow your catalog"
      backHref="/products"
      backLabel="Back to products"
      description="Add the essentials. You can record stock once the product is created."
    >
      <ProductForm
        action={createProduct}
        initialValues={{ name: "", sku: "" }}
        submitLabel="Create product"
        pendingLabel="Creating..."
      />
    </FormPage>
  );
}
