"use client";

import { PageFeedback } from "@/components/PageFeedback";

type PageErrorProps = {
  retry: () => void;
};

export default function PageError({ retry }: PageErrorProps) {
  return (
    <PageFeedback
      eyebrow="A small interruption"
      title="Let’s try that again."
      message="This page could not be loaded. Please try again."
      role="alert"
    >
      <button type="button" onClick={() => retry()} className="button-primary">
        Try again
      </button>
    </PageFeedback>
  );
}