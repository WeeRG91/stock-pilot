import { PageFeedback } from "@/components/PageFeedback";

export default function ProductsLoading() {
  return (
    <PageFeedback
      eyebrow="Your catalog"
      title="Opening your catalog."
      message="Loading products…"
    >
      <div
        aria-hidden="true"
        className="w-full space-y-3 motion-safe:animate-pulse"
      >
        <div className="h-10 rounded-xl bg-surface-muted" />
        <div className="h-10 rounded-xl bg-surface-muted" />
        <div className="h-10 rounded-xl bg-surface-muted" />
      </div>
    </PageFeedback>
  );
}