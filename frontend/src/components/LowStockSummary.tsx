"use client";

import { useState } from "react";
import { SummaryCard } from "@/components/SummaryCard";

type LowStockSummaryProps = {
  value: number;
};

export function LowStockSummary({ value }: LowStockSummaryProps) {
  const [visible, setVisible] = useState(true);

  return (
    <section className="mt-6">
      <button
        type="button"
        aria-expanded={visible}
        aria-controls="low-stock-summary"
        onClick={() => setVisible((previous) => !previous)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
      >
        {visible ? "Hide low-stock summary" : "Show low-stock summary"}
      </button>

      <div id="low-stock-summary" hidden={!visible} className="mt-4">
        <SummaryCard
          title="Low-stock products"
          value={value}
          description="Sample products below their stock threshold."
        />
      </div>
    </section>
  );
}