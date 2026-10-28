"use server";

import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";
import { parseStockInResponse } from "@/lib/parseStockInResponse";
import { readStockQuantityFormData } from "@/lib/readStockQuantityFormData";
import { StockMovementFormState } from "@/types/stockMovementForm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

export async function recordStockIn(
  productId: number,
  _previousState: StockMovementFormState,
  formData: FormData,
): Promise<StockMovementFormState> {
  const state = readStockQuantityFormData(formData);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return {
      ...state,
      message: "Invalid product identifier.",
    };
  }

  if (state.fieldErrors.quantity) {
    return state;
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return {
      ...state,
      message: "Stock recording is unavailable. Please contact the developer.",
    };
  }

  const quantity = Number(state.values.quantity.trim());

  try {
    const headers = await getApiMutationHeaders();

    const response = await fetch(
      new URL(`/api/products/${productId}/stock-in`, apiUrl),
      {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        headers,
        body: JSON.stringify({ quantity }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (response.status === 401) {
      redirect("/login");
    }

    if (response.status === 403) {
      return {
        ...state,
        message: "Request verification failed. Please submit the form again.",
      };
    }

    if (response.status === 404) {
      return {
        ...state,
        message: "This product no longer exists.",
      };
    }

    if (response.status === 409) {
      return {
        ...state,
        message: "This product is inactive. Stock cannot be recorded.",
      };
    }

    if (response.status === 422) {
      return {
        ...state,
        fieldErrors: {
          quantity: "Enter a whole number between 1 and 2147483647.",
        },
        message: "Please correct the highlighted field.",
      };
    }

    if (response.status !== 201) {
      return {
        ...state,
        message:
          "Stock recording could not be confirmed. Check movement history before retrying.",
      };
    }

    const payload: unknown = await response.json();
    const result = parseStockInResponse(payload);

    if (
      result.data.productId !== productId ||
      result.data.quantity !== quantity
    ) {
      throw new Error("Unexpected stock-in response.");
    }
  } catch (error) {
    unstable_rethrow(error);

    return {
      ...state,
      message:
        "Stock recording could not be confirmed. Check movement history before retrying.",
    };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");

  redirect(`/products/${productId}?stockIn=recorded`);
}
