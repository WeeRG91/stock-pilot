import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { redirect } from "next/navigation";
import type { ProductFormState } from "@/types/productForm";
import { createProduct } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

const initialState: ProductFormState = {
  values: { name: "", sku: "" },
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
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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