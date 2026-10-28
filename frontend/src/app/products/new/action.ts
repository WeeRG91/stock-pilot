"use server";

import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";
import { mapProductValidationErrors } from "@/lib/mapProductValidationErrors";
import { parseProductResponse } from "@/lib/parseProductResponse";
import { readProductFormData } from "@/lib/readProductFormData";
import type { ProductFormState } from "@/types/productForm";
import { redirect, unstable_rethrow } from "next/navigation";

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const state = readProductFormData(formData);

  if (Object.keys(state.fieldErrors).length > 0) {
    return state;
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return {
      ...state,
      message: "Product creation is unavailable. Please contact the developer.",
    };
  }

  let createdProductId: number;

  try {
    const headers = await getApiMutationHeaders();

    const response = await fetch(new URL("/api/products", apiUrl), {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers,
      body: JSON.stringify(state.values),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401) {
      redirect("/login");
    }

    if (response.status === 403) {
      return {
        ...state,
        message: "Request verification failed. Please submit the form again.",
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

    if (response.status !== 201) {
      return {
        ...state,
        message:
          "Creation could not be confirmed. Check the product list before retrying.",
      };
    }

    const payload: unknown = await response.json();
    const result = parseProductResponse(payload);

    createdProductId = result.data.id;
  } catch (error) {
    unstable_rethrow(error)

    return {
      ...state,
      message:
        "Creation could not be confirmed. Check the product list before retrying.",
    };
  }

  redirect(`/products/${createdProductId}`);
}
