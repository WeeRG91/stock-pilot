import type { StockMovement } from "@/types/stockMovement";

type MovementHistoryProps = {
  movements: StockMovement[];
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function MovementHistory({ movements }: MovementHistoryProps) {
  return (
    <section
      className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface"
      aria-labelledby="movement-history-heading"
    >
      <div className="border-b border-line px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Activity journal
        </p>

        <h2
          id="movement-history-heading"
          className="mt-2 text-xl font-semibold tracking-tight text-foreground"
        >
          Recent stock movements
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Up to 20 most recent movements. Dates are shown in UTC.
          Current stock includes all movements.
        </p>
      </div>

      {movements.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-muted">
          No stock movements recorded.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-140 text-left text-sm">
            <caption className="sr-only">Recent stock movements</caption>

            <thead className="bg-surface-muted/50 text-xs text-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Movement ID
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Date (UTC)
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 text-right font-medium">
                  Quantity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="transition-colors hover:bg-surface-muted/30"
                >
                  <td className="px-6 py-5 font-mono text-xs text-muted">
                    #{movement.id}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-muted">
                    <time dateTime={movement.createdAt}>
                      {dateFormatter.format(new Date(movement.createdAt))}
                    </time>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                        movement.type === "in"
                          ? "bg-success-soft text-success"
                          : "bg-accent-soft text-accent"
                      }`}
                    >
                      {movement.type === "in" ? "Stock in" : "Stock out"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right font-semibold text-foreground tabular-nums">
                    {movement.type === "in" ? "+" : "−"}
                    {movement.quantity.toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}