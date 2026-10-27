import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { StockMovementFormState } from "@/types/stockMovementForm";
import { recordStockOut } from "./action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

const initialState: StockMovementFormState = {
  values: { quantity: "" },
  fieldErrors: {},
  message: "",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("STOCKPILOT_API_URL", "http://stockpilot.test:8000");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test("posts a numeric quantity, refreshes pages, and redirects", async () => {
  const formData = new FormData();
  formData.set("quantity", " 2 ");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        data: {
          id: 10,
          productId: 2,
          type: "out",
          quantity: 2,
          createdAt: "2026-10-27T11:00:00+00:00",
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const redirectSignal = new Error("Test redirect");

  vi.mocked(redirect).mockImplementationOnce(() => {
    throw redirectSignal;
  });

  await expect(recordStockOut(2, initialState, formData)).rejects.toBe(
    redirectSignal,
  );

  expect(fetchMock).toHaveBeenCalledOnce();

  const [url, options] = fetchMock.mock.calls[0];

  expect(String(url)).toBe(
    "http://stockpilot.test:8000/api/products/2/stock-out",
  );
  expect(options).toEqual(
    expect.objectContaining({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: 2 }),
    }),
  );

  expect(revalidatePath).toHaveBeenCalledTimes(2);
  expect(revalidatePath).toHaveBeenCalledWith("/products/2");
  expect(revalidatePath).toHaveBeenCalledWith("/products");

  expect(redirect).toHaveBeenCalledOnce();
  expect(redirect).toHaveBeenCalledWith("/products/2?stockOut=recorded");
});

test("preserves quantity and reports insufficient stock", async () => {
  const formData = new FormData();
  formData.set("quantity", "5");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: { message: "Insufficient stock." },
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await recordStockOut(2, initialState, formData);

  expect(result).toEqual({
    values: { quantity: "5" },
    fieldErrors: {
      quantity: "Not enough stock. Reload to check the current balance.",
    },
    message: "Stock was not issued.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("reports an inactive product without refreshing or redirecting", async () => {
  const formData = new FormData();
  formData.set("quantity", "2");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: {
          message: "Cannot record stock movements for an inactive product.",
        },
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await recordStockOut(2, initialState, formData);

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message: "This product is inactive. Stock cannot be issued.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("uses a generic message for an unknown conflict", async () => {
  const formData = new FormData();
  formData.set("quantity", "2");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: { message: "Unexpected internal conflict details." },
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await recordStockOut(2, initialState, formData);

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message: "Stock could not be issued. Reload the product before retrying.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test.each([
  {
    description: "an unexpected HTTP status",
    status: 500,
    body: "",
  },
  {
    description: "malformed JSON",
    status: 201,
    body: '{"data":',
  },
  {
    description: "invalid movement data",
    status: 201,
    body: JSON.stringify({ data: null }),
  },
  {
    description: "a mismatched product",
    status: 201,
    body: JSON.stringify({
      data: {
        id: 10,
        productId: 999,
        type: "out",
        quantity: 2,
        createdAt: "2026-10-27T11:00:00+00:00",
      },
    }),
  },
  {
    description: "a mismatched quantity",
    status: 201,
    body: JSON.stringify({
      data: {
        id: 10,
        productId: 2,
        type: "out",
        quantity: 3,
        createdAt: "2026-10-27T11:00:00+00:00",
      },
    }),
  },
])("handles $description without retrying", async ({ status, body }) => {
  const formData = new FormData();
  formData.set("quantity", "2");

  fetchMock.mockResolvedValueOnce(
    new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await recordStockOut(2, initialState, formData);

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message:
      "Stock recording could not be confirmed. Check movement history before retrying.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("handles a network failure without retrying", async () => {
  const formData = new FormData();
  formData.set("quantity", "2");

  fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

  const result = await recordStockOut(2, initialState, formData);

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message:
      "Stock recording could not be confirmed. Check movement history before retrying.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

function quantityForm(quantity = "2"): FormData {
  const formData = new FormData();
  formData.set("quantity", quantity);
  return formData;
}

test.each(["", "0", "1.5"])(
  "rejects invalid quantity %j before requesting the API",
  async (quantity) => {
    const result = await recordStockOut(
      2,
      initialState,
      quantityForm(quantity),
    );

    expect(result.values.quantity).toBe(quantity);
    expect(result.fieldErrors.quantity).toBe("Enter a positive whole number.");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  },
);

test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid product ID %s before requesting the API",
  async (productId) => {
    const result = await recordStockOut(
      productId,
      initialState,
      quantityForm(),
    );

    expect(result.message).toBe("Invalid product identifier.");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  },
);

test("reports missing API configuration without making a request", async () => {
  vi.stubEnv("STOCKPILOT_API_URL", undefined);

  const result = await recordStockOut(2, initialState, quantityForm());

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message: "Stock recording is unavailable. Please contact the developer.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("reports a missing product without success navigation", async () => {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

  const result = await recordStockOut(2, initialState, quantityForm());

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {},
    message: "This product no longer exists.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("returns quantity feedback for API validation errors", async () => {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 422 }));

  const result = await recordStockOut(2, initialState, quantityForm());

  expect(result).toEqual({
    values: { quantity: "2" },
    fieldErrors: {
      quantity: "Enter a whole number between 1 and 2147483647.",
    },
    message: "Please correct the highlighted field.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});
