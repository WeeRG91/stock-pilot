import Link from "next/link";
import { PageFeedback } from "@/components/PageFeedback";

export default function ProductNotFound() {
  return (
    <PageFeedback
      eyebrow="Product unavailable"
      title="Product not found"
      message="The requested product could not be found."
    >
      <Link href="/products" className="button-primary">
        Back to products
      </Link>
    </PageFeedback>
  );
}