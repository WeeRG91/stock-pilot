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
    <section className="mt-10" aria-labelledby="movement-history-heading">
      <h2
        id="movement-history-heading"
        className="text-xl font-semibold text-zinc-900"
      >
        Recent stock movements
      </h2>

      <p className="mt-2 text-sm text-zinc-600">
        Up to 20 most recent movements. Dates are shown in UTC.
        Current stock includes all movements.
      </p>

      {movements.length === 0 ? (
        <p className="mt-4 text-zinc-700">No stock movements recorded.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-900">
            <caption className="sr-only">Recent stock movements</caption>
            <thead>
              <tr className="border-b border-zinc-300">
                <th scope="col" className="px-3 py-2">Movement ID</th>
                <th scope="col" className="px-3 py-2">Date (UTC)</th>
                <th scope="col" className="px-3 py-2">Type</th>
                <th scope="col" className="px-3 py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-zinc-200">
                  <td className="px-3 py-2">{movement.id}</td>
                  <td className="px-3 py-2">
                    <time dateTime={movement.createdAt}>
                      {dateFormatter.format(new Date(movement.createdAt))}
                    </time>
                  </td>
                  <td className="px-3 py-2">
                    {movement.type === "in" ? "Stock in" : "Stock out"}
                  </td>
                  <td className="px-3 py-2">
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