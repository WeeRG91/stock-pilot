import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/getProduct.server";
import { updateProduct } from "./action";
import { ProductForm } from "@/components/ProductForm";

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
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/products/${product.id}`}
          className="text-zinc-700 underline"
        >
          Back to product
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          Edit {product.name}
        </h1>

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
      </div>
    </main>
  );
}