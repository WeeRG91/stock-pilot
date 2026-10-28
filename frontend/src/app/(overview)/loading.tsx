import { PageFeedback } from "@/components/PageFeedback";

export default function OverviewLoading() {
  return (
    <PageFeedback
      eyebrow="Your workspace"
      title="Gathering your overview."
      message="Loading inventory overview…"
    >
      <div
        aria-hidden="true"
        className="grid w-full grid-cols-3 gap-3 motion-safe:animate-pulse"
      >
        <div className="h-16 rounded-2xl bg-surface-muted" />
        <div className="h-16 rounded-2xl bg-accent-soft" />
        <div className="h-16 rounded-2xl bg-success-soft" />
      </div>
    </PageFeedback>
  );
}