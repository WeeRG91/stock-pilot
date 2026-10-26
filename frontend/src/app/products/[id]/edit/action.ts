"use server";

import { redirect } from "next/navigation";
import { mapProductValidationErrors } from "@/lib/mapProductValidationErrors";
import { parseProductResponse } from "@/lib/parseProductResponse";
import { readProductFormData } from "@/lib/readProductFormData";
import type { ProductFormState } from "@/types/productForm";

export async function updateProduct(
  productId: number,
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const state = readProductFormData(formData);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return {
      ...state,
      message: "Invalid product identifier.",
    };
  }

  if (Object.keys(state.fieldErrors).length > 0) {
    return state;
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return {
      ...state,
      message: "Product updates are unavailable. Please contact the developer.",
    };
  }

  try {
    const response = await fetch(
      new URL(`/api/products/${productId}`, apiUrl),
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.values),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (response.status === 404) {
      return {
        ...state,
        message: "This product no longer exists.",
      };
    }

    if (response.status === 409) {
      return {
        ...state,
        fieldErrors: {
          sku: "A product with this SKU already exists.",
        },
        message: "Please correct the highlighted field.",
      };
    }

    if (response.status === 422) {
      const payload: unknown = await response.json();

      return mapProductValidationErrors(payload, state);
    }

    if (response.status !== 200) {
      return {
        ...state,
        message:
          "Update could not be confirmed. Check the product details before retrying.",
      };
    }

    const payload: unknown = await response.json();
    const result = parseProductResponse(payload);

    if (result.data.id !== productId) {
      throw new Error("Updated product identifier does not match.");
    }
  } catch {
    return {
      ...state,
      message:
        "Update could not be confirmed. Check the product details before retrying.",
    };
  }

  redirect(`/products/${productId}`);
}