export default function OverviewLoading() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">StockPilot</h1>
        <p role="status" className="mt-4 text-zinc-600">
          Loading inventory overview…
        </p>
      </div>
    </main>
  );
}