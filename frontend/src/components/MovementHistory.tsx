import type {
  MovementHistoryResponse,
  StockMovement,
} from "@/types/stockMovement";
import Link from "next/link";

type MovementHistoryProps = {
  productId: number;
  movements: StockMovement[];
  meta: MovementHistoryResponse["meta"];
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function MovementHistory({
  productId,
  movements,
  meta,
}: MovementHistoryProps) {
  const pageHref = (page: number) =>
    `/products/${productId}?page=${page}&limit=${meta.limit}#movement-history`;

  return (
    <section
      id="movement-history"
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
          Stock movements
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Newest movements first. Dates are shown in UTC. Current stock includes
          all movements.
        </p>

        <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-muted">
          <p>
            Showing {movements.length} of {meta.total} movements
          </p>
          <p>
            Requested page {meta.page} · {meta.totalPages} total pages
          </p>
        </div>
      </div>

      {movements.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-muted">
          {meta.total === 0
            ? "No stock movements recorded."
            : "No movements on this page."}
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

      <nav
        aria-label="Movement history pagination"
        className="flex items-center justify-between gap-4 border-t border-line px-6 py-5"
      >
        {meta.page > 1 && meta.totalPages > 0 ? (
          <Link
            href={pageHref(Math.min(meta.page - 1, meta.totalPages))}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            <span aria-hidden="true">←</span> Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-muted opacity-50"
          >
            <span aria-hidden="true">←</span> Previous
          </span>
        )}

        {meta.page < meta.totalPages ? (
          <Link
            href={pageHref(meta.page + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            Next <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-muted opacity-50"
          >
            Next <span aria-hidden="true">→</span>
          </span>
        )}
      </nav>
    </section>
  );
}
