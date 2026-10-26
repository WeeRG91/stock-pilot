import { getProduct } from "@/lib/getProduct.server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setProductActivation } from "./activation-actions";
import { ProductActivationControl } from "@/components/ProductActivationControl";

export default async function ProductDetailsPage({
  params,
  searchParams,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  const changeActivation = setProductActivation.bind(
    null,
    product.id,
    !product.active,
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/products" className="text-zinc-700 underline">
          Back to products
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          {product.name}
        </h1>

        {query.stockIn === "recorded" && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-green-50 p-4 text-green-800"
          >
            Stock received successfully.
          </p>
        )}

        <Link
          href={`/products/${product.id}/edit`}
          className="mt-4 inline-block text-zinc-700 underline"
        >
          Edit product
        </Link>

        {product.active && (
          <Link
            href={`/products/${product.id}/stock-in`}
            className="ml-4 mt-4 inline-block text-zinc-700 underline"
          >
            Record stock in
          </Link>
        )}

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

        <ProductActivationControl
          key={product.id}
          active={product.active}
          action={changeActivation}
        />
      </div>
    </main>
  );
}
