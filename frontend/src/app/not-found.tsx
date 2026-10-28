import Link from "next/link";
import { PageFeedback } from "@/components/PageFeedback";

export default function NotFound() {
  return (
    <PageFeedback
      eyebrow="404 · A little off course"
      title="This page isn’t here."
      message="The address may have changed. Let’s get you back to your workspace."
    >
      <Link href="/" className="button-primary">
        Back to overview
      </Link>
    </PageFeedback>
  );
}