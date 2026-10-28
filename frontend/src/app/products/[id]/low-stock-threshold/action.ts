"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { parseLowStockThresholdResponse } from "@/lib/parseLowStockThresholdResponse";
import { readLowStockThresholdFormData } from "@/lib/readLowStockThresholdFormData";
import type { LowStockThresholdFormState } from "@/types/lowStockThreshold";
import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";

export async function saveLowStockThreshold(
  productId: number,
  _previousState: LowStockThresholdFormState,
  formData: FormData,
): Promise<LowStockThresholdFormState> {
  const state = readLowStockThresholdFormData(formData);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return {
      ...state,
      message: "Invalid product identifier.",
    };
  }

  if (state.fieldErrors.threshold) {
    return state;
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return {
      ...state,
      message: "Threshold updates are unavailable.",
    };
  }

  const threshold = Number(state.values.threshold.trim());

  try {
    const headers = await getApiMutationHeaders();

    const response = await fetch(
      new URL(`/api/products/${productId}/low-stock-threshold`, apiUrl),
      {
        method: "PUT",
        cache: "no-store",
        redirect: "error",
        headers,
        body: JSON.stringify({ threshold }),
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

    if (response.status === 422) {
      return {
        ...state,
        fieldErrors: {
          threshold: "Enter a whole number between 0 and 2147483647.",
        },
        message: "Please correct the highlighted field.",
      };
    }

    if (response.status !== 200) {
      throw new Error("Unexpected threshold-update status.");
    }

    const payload: unknown = await response.json();
    const result = parseLowStockThresholdResponse(payload);

    if (
      result.data.productId !== productId ||
      result.data.threshold !== threshold
    ) {
      throw new Error("Unexpected threshold-update response.");
    }
  } catch (error) {
    unstable_rethrow(error);

    return {
      ...state,
      message:
        "Threshold update could not be confirmed. Reload the setting before retrying.",
    };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/");

  redirect(`/products/${productId}?threshold=updated`);
}
