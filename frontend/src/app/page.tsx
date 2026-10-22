import { LowStockSummary } from "@/components/LowStockSummary";
import { ProductSearch } from "@/components/ProductSearch";
import { SummaryCard } from "@/components/SummaryCard";

const summaryItems = [{ id: "products", title: "Products", value: 24 }];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-900">StockPilot</h1>

        <p className="mt-2 text-zinc-600">
          Inventory overview — sample data for learning.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {summaryItems.map((item) => (
            <SummaryCard key={item.id} title={item.title} value={item.value} />
          ))}
        </div>

        <LowStockSummary value={3} />

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
