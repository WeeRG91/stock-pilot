import { ProductSearch } from "@/components/ProductSearch";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">Products</h1>

        <p className="mt-2 text-zinc-600">
          Search sample products — no backend connection yet.
        </p>

        <ProductSearch
          productNames={[
            "Wireless Mouse",
            "Mechanical Keyboard",
            "USB-C Cable",
          ]}
        />
      </div>
    </main>
  );
}