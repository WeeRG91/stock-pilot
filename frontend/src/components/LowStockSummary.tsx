"use client";

import { useState } from "react";

type LowStockSummaryProps = {
  value: number;
};

export function LowStockSummary({ value }: LowStockSummaryProps) {
  const [visible, setVisible] = useState(true);

  return (
    <section className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Stock watch
        </p>

        <button
          type="button"
          aria-expanded={visible}
          aria-controls="low-stock-summary"
          onClick={() => setVisible((previous) => !previous)}
          className="rounded-full px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          {visible ? "Hide low-stock summary" : "Show low-stock summary"}
        </button>
      </div>

      <div id="low-stock-summary" hidden={!visible}>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-semibold tabular-nums ${
              value > 0
                ? "bg-accent-soft text-accent"
                : "bg-success-soft text-success"
            }`}
          >
            {value.toLocaleString("en-GB")}
          </span>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Low-stock products
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Active products at or below their threshold, including out-of-stock products.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}