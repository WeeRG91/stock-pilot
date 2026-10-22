export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
        <p className="mt-4 text-zinc-600" role="status">
          Loading products…
        </p>
      </div>
    </main>
  );
}