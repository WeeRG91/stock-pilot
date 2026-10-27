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
    <section className="mt-10" aria-labelledby="dashboard-movements-heading">
      <h2
        id="dashboard-movements-heading"
        className="text-xl font-semibold text-zinc-900"
      >
        Recent stock movements
      </h2>

      <p className="mt-2 text-sm text-zinc-600">
        The five most recent movements across all products. Dates are UTC.
      </p>

      {movements.length === 0 ? (
        <p className="mt-4 text-zinc-700">No stock movements recorded.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-900">
            <caption className="sr-only">
              Latest movements across all products
            </caption>
            <thead>
              <tr className="border-b border-zinc-300">
                <th scope="col" className="px-3 py-2">Product</th>
                <th scope="col" className="px-3 py-2">Type</th>
                <th scope="col" className="px-3 py-2">Quantity</th>
                <th scope="col" className="px-3 py-2">Date (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-zinc-200">
                  <td className="px-3 py-2">
                    <Link
                      href={`/products/${movement.productId}`}
                      className="underline"
                    >
                      {movement.productName}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-600">
                      {movement.productSku}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    {movement.type === "in" ? "Stock in" : "Stock out"}
                  </td>
                  <td className="px-3 py-2">
                    {movement.type === "in" ? "+" : "−"}
                    {movement.quantity.toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2">
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