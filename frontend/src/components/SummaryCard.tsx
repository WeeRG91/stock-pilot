type SummaryCardProps = {
  title: string;
  value: number;
  description?: string;
};

export function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-medium text-zinc-600">{title}</h2>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      )}
    </div>
  );
}
