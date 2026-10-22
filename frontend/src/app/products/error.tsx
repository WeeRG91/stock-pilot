"use client";

type ProductsErrorProps = {
  retry: () => void;
};

export default function ProductsError({ retry }: ProductsErrorProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">Products</h1>

        <p className="mt-4 text-zinc-600" role="alert">
          Products could not be loaded. Please try again.
        </p>

        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}