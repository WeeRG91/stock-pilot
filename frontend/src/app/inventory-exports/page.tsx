import { InventoryExportAutoRefresh } from "@/components/InventoryExportAutoRefresh";
import { InventoryExportForm } from "@/components/InventoryExportForm";
import { getInventoryExports } from "@/lib/getInventoryExports.server";
import Link from "next/link";

const statusLabels = {
  pending: "Preparing",
  ready: "Ready",
  failed: "Failed",
};

const statusStyles = {
  pending: "bg-surface-muted text-muted",
  ready: "bg-success-soft text-success",
  failed: "bg-danger/10 text-danger",
};

export default async function InventoryExportsPage() {
  const exports = await getInventoryExports();
  const hasPending = exports.some((item) => item.status === "pending");

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Luxembourg",
  });

  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/products"
          className="text-sm text-muted hover:text-accent"
        >
          ← Back to products
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="font-serif text-4xl tracking-tight text-foreground">
              Inventory exports
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted">
              Download stock snapshots or request a new CSV of all products.
            </p>
          </div>

          <InventoryExportForm />
        </div>

        {hasPending && <InventoryExportAutoRefresh />}

        <section className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-medium text-foreground">Recent exports</h2>
            <p className="mt-1 text-xs text-muted">
              Showing the latest 20 requests.
            </p>
          </div>

          {exports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-foreground">No exports yet</p>
              <p className="mt-2 text-sm text-muted">
                Request your first export using the button above.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {exports.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
                >
                  <div>
                    <Link
                      href={`/inventory-exports/${item.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      Inventory export #{item.id}
                    </Link>

                    <p className="mt-1 text-xs text-muted">
                      Requested{" "}
                      <time dateTime={item.createdAt}>
                        {dateFormatter.format(new Date(item.createdAt))}
                      </time>
                      {" · Luxembourg time"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>

                    {item.status === "ready" ? (
                      <a
                        href={`/inventory-exports/${item.id}/download`}
                        aria-label={`Download CSV for export ${item.id}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Download CSV
                      </a>
                    ) : (
                      <Link
                        href={`/inventory-exports/${item.id}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}