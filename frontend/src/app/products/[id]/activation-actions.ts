"use server";

import { parseProductResponse } from "@/lib/parseProductResponse";
import type { ProductActivationState } from "@/types/productActivation";
import { revalidatePath } from "next/cache";

export async function setProductActivation(
  productId: number,
  active: boolean,
): Promise<ProductActivationState> {
  if (
    !Number.isSafeInteger(productId) ||
    productId < 1 ||
    typeof active !== "boolean"
  ) {
    return { error: "Invalid product activation request." };
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return { error: "Product activation is unavailable." };
  }

  const operation = active ? "activate" : "deactivate";

  try {
    const response = await fetch(
      new URL(`/api/products/${productId}/${operation}`, apiUrl),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (response.status === 404) {
      return { error: "This product no longer exists." };
    }

    if (response.status !== 200) {
      return {
        error:
          "Status change could not be confirmed. Reload the product before retrying.",
      };
    }

    const payload: unknown = await response.json();
    const result = parseProductResponse(payload);

    if (result.data.id !== productId || result.data.active !== active) {
      throw new Error("Unexpected product activation response.");
    }
  } catch {
    return {
      error:
        "Status change could not be confirmed. Reload the product before retrying.",
    };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");

  return { error: "" };
}
