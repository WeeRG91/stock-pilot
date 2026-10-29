import { InventoryExportAutoRefresh } from "@/components/InventoryExportAutoRefresh";
import { getInventoryExport } from "@/lib/getInventoryExport.server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InventoryExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  const inventoryExport = await getInventoryExport(Number(id));

  if (inventoryExport === null) {
    notFound();
  }

  const isReady = inventoryExport.status === "ready";

  const presentation = {
    pending: {
      label: "Preparing",
      title: "Your export is on its way",
      description:
        "We're preparing a CSV of all products and their current stock.",
      badge: "bg-surface-muted text-muted",
    },
    ready: {
      label: "Ready",
      title: "Your export is ready",
      description:
        "Download your CSV to open it in Excel or another spreadsheet app.",
      badge: "bg-success-soft text-success",
    },
    failed: {
      label: "Failed",
      title: "We couldn't prepare your export",
      description:
        "Please contact the administrator and include the export number below.",
      badge: "bg-danger/10 text-danger",
    },
  }[inventoryExport.status];

  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/products" className="text-sm text-muted hover:text-accent">
          ← Back to products
        </Link>

        <section className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Inventory export #{inventoryExport.id}
            </p>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${presentation.badge}`}
            >
              {presentation.label}
            </span>
          </div>

          <div role="status" aria-live="polite" aria-atomic="true">
            <h1 className="mt-6 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              {presentation.title}
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted">
              {presentation.description}
            </p>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Format</dt>
              <dd className="mt-1 font-medium text-foreground">CSV</dd>
            </div>

            <div>
              <dt className="text-muted">Includes</dt>
              <dd className="mt-1 font-medium text-foreground">
                All products · SKU, name, stock
              </dd>
            </div>
          </dl>

          {inventoryExport.status === "pending" && (
            <InventoryExportAutoRefresh />
          )}

          {isReady && (
            <a
              href={`/inventory-exports/${inventoryExport.id}/download`}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Download CSV
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
