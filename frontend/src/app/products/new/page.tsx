import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";
import { createProduct } from "./action";

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/products" className="text-zinc-700 underline">
          Back to products
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          Create product
        </h1>

        <ProductForm 
          action={createProduct}
          initialValues={{name: "", sku: ""}}
          submitLabel="Create product"
          pendingLabel="Creating..."
        />
      </div>
    </main>
  );
}