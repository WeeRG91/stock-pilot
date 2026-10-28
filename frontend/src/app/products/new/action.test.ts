import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { redirect, unstable_rethrow } from "next/navigation";
import { getApiMutationHeaders } from "@/lib/getApiMutationHeaders.server";
import type { ProductFormState } from "@/types/productForm";
import { createProduct } from "./action";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  unstable_rethrow: vi.fn(),
}));

vi.mock("@/lib/getApiMutationHeaders.server", () => ({
  getApiMutationHeaders: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

const initialState: ProductFormState = {
  values: { name: "", sku: "" },
  fieldErrors: {},
  message: "",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getApiMutationHeaders).mockResolvedValue({
    Accept: "application/json",
    Cookie: "STOCKPILOTSESSID=test-session",
    "Content-Type": "application/json",
    "X-CSRF-Token": "test-api-token",
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("STOCKPILOT_API_URL", "http://stockpilot.test:8000");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test("returns field errors without requesting the API or redirecting", async () => {
  const formData = new FormData();
  formData.set("name", "   ");
  formData.set("sku", "");

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: { name: "   ", sku: "" },
    fieldErrors: {
      name: "Name is required.",
      sku: "SKU is required.",
    },
    message: "Please correct the highlighted fields.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(getApiMutationHeaders).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("returns a duplicate SKU error and preserves submitted values", async () => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-001");

  fetchMock.mockResolvedValueOnce(
    new Response(null, { status: 409 }),
  );

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Mechanical Keyboard",
      sku: "KEYBOARD-001",
    },
    fieldErrors: {
      sku: "A product with this SKU already exists.",
    },
    message: "Please correct the highlighted field.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(redirect).not.toHaveBeenCalled();
});

test("maps API validation errors and preserves submitted values", async () => {
  const name = "A".repeat(151);
  const formData = new FormData();
  formData.set("name", name);
  formData.set("sku", "KEYBOARD-NEW");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: {
          message: "Validation failed.",
          details: [
            {
              field: "name",
              message: "Name must not exceed 150 characters.",
            },
          ],
        },
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await createProduct(initialState, formData);

  expect(result.values).toEqual({
    name,
    sku: "KEYBOARD-NEW",
  });
  expect(result.fieldErrors).toEqual({
    name: "Name must not exceed 150 characters.",
  });
  expect(result.message).not.toBe("");
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(redirect).not.toHaveBeenCalled();
});

test("posts product details and redirects to the created product", async () => {
  const formData = new FormData();
  formData.set("name", " Mechanical Keyboard ");
  formData.set("sku", " KEYBOARD-NEW ");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        data: {
          id: 42,
          name: "Mechanical Keyboard",
          sku: "KEYBOARD-NEW",
          active: true,
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

  await expect(
    createProduct(initialState, formData),
  ).rejects.toBe(redirectSignal);

  expect(fetchMock).toHaveBeenCalledOnce();

  const [url, options] = fetchMock.mock.calls[0];

  expect(String(url)).toBe(
    "http://stockpilot.test:8000/api/products",
  );
  expect(options).toEqual(
    expect.objectContaining({
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        Accept: "application/json",
        Cookie: "STOCKPILOTSESSID=test-session",
        "Content-Type": "application/json",
        "X-CSRF-Token": "test-api-token",
      },
      body: JSON.stringify({
        name: " Mechanical Keyboard ",
        sku: " KEYBOARD-NEW ",
      }),
    }),
  );

  expect(redirect).toHaveBeenCalledOnce();
  expect(redirect).toHaveBeenCalledWith("/products/42");
});

test("preserves the login redirect when the API session has expired", async () => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

  const redirectSignal = new Error("Test login redirect");
  vi.mocked(redirect).mockImplementationOnce(() => {
    throw redirectSignal;
  });
  vi.mocked(unstable_rethrow).mockImplementationOnce((error) => {
    if (error === redirectSignal) throw error;
  });

  await expect(createProduct(initialState, formData)).rejects.toBe(redirectSignal);

  expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
  expect(unstable_rethrow).toHaveBeenCalledWith(redirectSignal);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("preserves submitted values when CSRF verification fails", async () => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: { name: "Mechanical Keyboard", sku: "KEYBOARD-NEW" },
    fieldErrors: {},
    message: "Request verification failed. Please submit the form again.",
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(redirect).not.toHaveBeenCalled();
});

test("preserves a missing-session redirect without submitting the mutation", async () => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");

  const redirectSignal = new Error("Test missing-session redirect");
  vi.mocked(getApiMutationHeaders).mockRejectedValueOnce(redirectSignal);
  vi.mocked(unstable_rethrow).mockImplementationOnce((error) => {
    if (error === redirectSignal) throw error;
  });

  await expect(createProduct(initialState, formData)).rejects.toBe(redirectSignal);

  expect(unstable_rethrow).toHaveBeenCalledWith(redirectSignal);
  expect(fetchMock).not.toHaveBeenCalled();
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
    description: "invalid product data",
    status: 201,
    body: JSON.stringify({ data: null }),
  },
])("handles $description without redirecting", async ({ status, body }) => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");

  fetchMock.mockResolvedValueOnce(
    new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Mechanical Keyboard",
      sku: "KEYBOARD-NEW",
    },
    fieldErrors: {},
    message:
      "Creation could not be confirmed. Check the product list before retrying.",
  });
  expect(redirect).not.toHaveBeenCalled();
});

test("preserves submitted values after a network failure", async () => {
  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");

  fetchMock.mockRejectedValueOnce(
    new TypeError("Failed to fetch"),
  );

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Mechanical Keyboard",
      sku: "KEYBOARD-NEW",
    },
    fieldErrors: {},
    message:
      "Creation could not be confirmed. Check the product list before retrying.",
  });
  expect(redirect).not.toHaveBeenCalled();
});

test("reports missing configuration without requesting the API", async () => {
  vi.stubEnv("STOCKPILOT_API_URL", undefined);

  const formData = new FormData();
  formData.set("name", "Mechanical Keyboard");
  formData.set("sku", "KEYBOARD-NEW");

  const result = await createProduct(initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Mechanical Keyboard",
      sku: "KEYBOARD-NEW",
    },
    fieldErrors: {},
    message:
      "Product creation is unavailable. Please contact the developer.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});
