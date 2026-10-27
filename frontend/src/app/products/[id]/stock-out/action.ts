"use server"

import { StockMovementFormState } from "@/types/stockMovementForm";
import { readStockQuantityFormData } from "@/lib/readStockQuantityFormData";
import { parseStockOutResponse } from "@/lib/parseStockOutResponse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function recordStockOut(
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
    const response = await fetch(
      new URL(`/api/products/${productId}/stock-out`, apiUrl),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
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
      const payload: unknown = await response.json();

      const message =
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "object" &&
        payload.error !== null &&
        "message" in payload.error
          ? payload.error.message
          : undefined;

      if (message === "Insufficient stock.") {
        return {
          ...state,
          fieldErrors: {
            quantity: "Not enough stock. Reload to check the current balance.",
          },
          message: "Stock was not issued.",
        };
      }

      if (
        message === "Cannot record stock movements for an inactive product."
      ) {
        return {
          ...state,
          message: "This product is inactive. Stock cannot be issued.",
        };
      }

      return {
        ...state,
        message:
          "Stock could not be issued. Reload the product before retrying.",
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
      throw new Error("Unexpected stock-out status.");
    }

    const payload: unknown = await response.json();
    const result = parseStockOutResponse(payload);

    if (
      result.data.productId !== productId ||
      result.data.quantity !== quantity
    ) {
      throw new Error("Unexpected stock-out response.");
    }
  } catch {
    return {
      ...state,
      message:
        "Stock recording could not be confirmed. Check movement history before retrying.",
    };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");

  redirect(`/products/${productId}?stockOut=recorded`);
}
