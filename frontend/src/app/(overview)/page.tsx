import Link from "next/link";
import { DashboardMovements } from "@/components/DashboardMovement";
import { LowStockSummary } from "@/components/LowStockSummary";
import { SummaryCard } from "@/components/SummaryCard";
import { getDashboard } from "@/lib/getDashboard.server";

export default async function Home() {
  const { data } = await getDashboard();

  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Your workspace
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              Inventory, at a glance.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              A clear view of your products, stock levels, and recent activity.
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:self-auto"
          >
            <span aria-hidden="true">+</span>
            Add product
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total products"
            value={data.products.total}
            description="Everything in your catalog."
          />
          <SummaryCard
            title="Active products"
            value={data.products.active}
            description="Ready for stock operations."
          />
          <SummaryCard
            title="Inactive products"
            value={data.products.inactive}
            description="Kept safely in your records."
          />
          <SummaryCard
            title="Units in stock"
            value={data.stock.totalUnits}
            description="Across your entire inventory."
          />
        </div>

        <LowStockSummary value={data.products.lowStock} />
        <DashboardMovements movements={data.recentMovements} />
      </div>
    </main>
  );
}