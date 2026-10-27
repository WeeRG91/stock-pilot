import { DashboardMovements } from "@/components/DashboardMovement";
import { SummaryCard } from "@/components/SummaryCard";
import { getDashboard } from "@/lib/getDashboard.server";

export default async function Home() {
  const { data } = await getDashboard();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">StockPilot</h1>

        <p className="mt-2 text-zinc-600">Current inventory overview.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total products"
            value={data.products.total}
            description="All product records."
          />
          <SummaryCard
            title="Active products"
            value={data.products.active}
            description="Available for stock operations."
          />
          <SummaryCard
            title="Inactive products"
            value={data.products.inactive}
            description="History and stock remain available."
          />
          <SummaryCard
            title="Units in stock"
            value={data.stock.totalUnits}
            description="Across all products, including inactive products."
          />
        </div>

        <DashboardMovements movements={data.recentMovements} />
      </div>
    </main>
  );
}
