import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">
          Product not found
        </h1>

        <p className="mt-4 text-zinc-600">
          The requested product could not be found.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-block text-zinc-700 underline"
        >
          Back to products
        </Link>
      </div>
    </main>
  );
}