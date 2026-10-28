type SummaryCardProps = {
  title: string;
  value: number;
  description?: string;
};

export function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_4px_24px_rgba(65,49,32,0.03)]">
      <h2 className="text-sm font-medium text-muted">{title}</h2>

      <p className="mt-5 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {value.toLocaleString("en-GB")}
      </p>

      {description && (
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      )}
    </div>
  );
}