"use client";

import { PageFeedback } from "@/components/PageFeedback";

type ProductsErrorProps = {
  retry: () => void;
};

export default function ProductsError({ retry }: ProductsErrorProps) {
  return (
    <PageFeedback
      eyebrow="Catalog unavailable"
      title="Your products will be back."
      message="Products could not be loaded. Please try again."
      role="alert"
    >
      <button type="button" onClick={() => retry()} className="button-primary">
        Try again
      </button>
    </PageFeedback>
  );
}