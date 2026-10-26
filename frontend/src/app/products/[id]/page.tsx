import { getProduct } from "@/lib/getProduct.server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/products" className="text-zinc-700 underline">
          Back to products
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          {product.name}
        </h1>

        <Link
          href={`/products/${product.id}/edit`}
          className="mt-4 inline-block text-zinc-700 underline"
        >
          Edit product
        </Link>

        <dl className="mt-6 space-y-4 text-zinc-900">
          <div>
            <dt className="font-medium">Product ID</dt>
            <dd>{product.id}</dd>
          </div>
          <div>
            <dt className="font-medium">SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          <div>
            <dt className="font-medium">Status</dt>
            <dd>{product.active ? "Active" : "Inactive"}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
