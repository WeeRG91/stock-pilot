import Link from "next/link";
import type { DashboardMovement } from "@/types/dashboard";

type DashboardMovementsProps = {
  movements: DashboardMovement[];
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function DashboardMovements({
  movements,
}: DashboardMovementsProps) {
  return (
    <section
      className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface"
      aria-labelledby="dashboard-movements-heading"
    >
      <div className="border-b border-line px-5 py-6 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Activity journal
        </p>

        <h2
          id="dashboard-movements-heading"
          className="mt-2 text-xl font-semibold tracking-tight text-foreground"
        >
          Recent stock movements
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          The five most recent movements across all products. Dates are UTC.
        </p>
      </div>

      {movements.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-sm font-medium text-foreground">
            No stock movements recorded.
          </p>
          <p className="mt-2 text-sm text-muted">
            Your inventory activity will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <caption className="sr-only">
              Latest movements across all products
            </caption>

            <thead className="bg-surface-muted/50 text-xs text-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Product
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Movement
                </th>
                <th scope="col" className="px-6 py-4 text-right font-medium">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Date (UTC)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="transition-colors hover:bg-surface-muted/30"
                >
                  <td className="px-6 py-5">
                    <Link
                      href={`/products/${movement.productId}`}
                      className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                    >
                      {movement.productName}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {movement.productSku}
                    </p>
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

                  <td className="whitespace-nowrap px-6 py-5 text-muted">
                    <time dateTime={movement.createdAt}>
                      {dateFormatter.format(new Date(movement.createdAt))}
                    </time>
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