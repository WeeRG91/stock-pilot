import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { redirect } from "next/navigation";
import type { ProductFormState } from "@/types/productForm";
import { updateProduct } from "./action";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

const initialState: ProductFormState = {
  values: {
    name: "Mechanical Keyboard",
    sku: "KEYBOARD-001",
  },
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

test("puts edited values and redirects to the updated product", async () => {
  const formData = new FormData();
  formData.set("name", " Ergonomic Keyboard ");
  formData.set("sku", " KEYBOARD-002 ");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        data: {
          id: 2,
          name: "Ergonomic Keyboard",
          sku: "KEYBOARD-002",
          active: false,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const redirectSignal = new Error("Test redirect");

  vi.mocked(redirect).mockImplementationOnce(() => {
    throw redirectSignal;
  });

  await expect(
    updateProduct(2, initialState, formData),
  ).rejects.toBe(redirectSignal);

  expect(fetchMock).toHaveBeenCalledOnce();

  const [url, options] = fetchMock.mock.calls[0];

  expect(String(url)).toBe(
    "http://stockpilot.test:8000/api/products/2",
  );
  expect(options).toEqual(
    expect.objectContaining({
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: " Ergonomic Keyboard ",
        sku: " KEYBOARD-002 ",
      }),
    }),
  );

  expect(redirect).toHaveBeenCalledOnce();
  expect(redirect).toHaveBeenCalledWith("/products/2");
});

test("preserves edits when the product no longer exists", async () => {
  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "KEYBOARD-002");

  fetchMock.mockResolvedValueOnce(
    new Response(null, { status: 404 }),
  );

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "KEYBOARD-002",
    },
    fieldErrors: {},
    message: "This product no longer exists.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(redirect).not.toHaveBeenCalled();
});

test("preserves edits and reports a conflicting SKU", async () => {
  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "MOUSE-001");

  fetchMock.mockResolvedValueOnce(
    new Response(null, { status: 409 }),
  );

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "MOUSE-001",
    },
    fieldErrors: {
      sku: "A product with this SKU already exists.",
    },
    message: "Please correct the highlighted field.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(redirect).not.toHaveBeenCalled();
});

test("rejects a response containing a different product ID", async () => {
  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "KEYBOARD-002");

  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        data: {
          id: 999,
          name: "Ergonomic Keyboard",
          sku: "KEYBOARD-002",
          active: true,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "KEYBOARD-002",
    },
    fieldErrors: {},
    message:
      "Update could not be confirmed. Check the product details before retrying.",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(redirect).not.toHaveBeenCalled();
});

test("rejects blank fields before requesting the API", async () => {
  const formData = new FormData();
  formData.set("name", "   ");
  formData.set("sku", "");

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "   ",
      sku: "",
    },
    fieldErrors: {
      name: "Name is required.",
      sku: "SKU is required.",
    },
    message: "Please correct the highlighted fields.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

test("maps API validation errors while preserving edits", async () => {
  const name = "A".repeat(151);
  const formData = new FormData();
  formData.set("name", name);
  formData.set("sku", "KEYBOARD-002");

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

  const result = await updateProduct(2, initialState, formData);

  expect(result.values).toEqual({
    name,
    sku: "KEYBOARD-002",
  });
  expect(result.fieldErrors).toEqual({
    name: "Name must not exceed 150 characters.",
  });
  expect(result.message).not.toBe("");
  expect(fetchMock).toHaveBeenCalledOnce();
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
    status: 200,
    body: '{"data":',
  },
  {
    description: "invalid product data",
    status: 200,
    body: JSON.stringify({ data: null }),
  },
])("handles $description without redirecting", async ({ status, body }) => {
  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "KEYBOARD-002");

  fetchMock.mockResolvedValueOnce(
    new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "KEYBOARD-002",
    },
    fieldErrors: {},
    message:
      "Update could not be confirmed. Check the product details before retrying.",
  });
  expect(redirect).not.toHaveBeenCalled();
});

test("preserves edits after a network failure", async () => {
  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "KEYBOARD-002");

  fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "KEYBOARD-002",
    },
    fieldErrors: {},
    message:
      "Update could not be confirmed. Check the product details before retrying.",
  });
  expect(redirect).not.toHaveBeenCalled();
});

test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid product ID %s before requesting the API",
  async (productId) => {
    const formData = new FormData();
    formData.set("name", "Ergonomic Keyboard");
    formData.set("sku", "KEYBOARD-002");

    const result = await updateProduct(
      productId,
      initialState,
      formData,
    );

    expect(result).toEqual({
      values: {
        name: "Ergonomic Keyboard",
        sku: "KEYBOARD-002",
      },
      fieldErrors: {},
      message: "Invalid product identifier.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  },
);

test("reports missing configuration without requesting the API", async () => {
  vi.stubEnv("STOCKPILOT_API_URL", undefined);

  const formData = new FormData();
  formData.set("name", "Ergonomic Keyboard");
  formData.set("sku", "KEYBOARD-002");

  const result = await updateProduct(2, initialState, formData);

  expect(result).toEqual({
    values: {
      name: "Ergonomic Keyboard",
      sku: "KEYBOARD-002",
    },
    fieldErrors: {},
    message: "Product updates are unavailable. Please contact the developer.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});