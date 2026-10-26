import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { setProductActivation } from "./activation-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("STOCKPILOT_API_URL", "http://stockpilot.test:8000");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test.each([
  { active: true, operation: "activate" },
  { active: false, operation: "deactivate" },
])("requests $operation and refreshes product pages", async ({
  active,
  operation,
}) => {
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        data: {
          id: 2,
          name: "Ergonomic Keyboard",
          sku: "KEYBOARD-002",
          active,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const result = await setProductActivation(2, active);

  expect(result).toEqual({ error: "" });
  expect(fetchMock).toHaveBeenCalledOnce();

  const [url, options] = fetchMock.mock.calls[0];

  expect(String(url)).toBe(
    `http://stockpilot.test:8000/api/products/2/${operation}`,
  );
  expect(options).toEqual(
    expect.objectContaining({
      method: "POST",
      headers: { Accept: "application/json" },
    }),
  );

  expect(revalidatePath).toHaveBeenCalledTimes(2);
  expect(revalidatePath).toHaveBeenCalledWith("/products/2");
  expect(revalidatePath).toHaveBeenCalledWith("/products");
});

test("reports a missing product without refreshing pages", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(null, { status: 404 }),
  );

  const result = await setProductActivation(2, false);

  expect(result).toEqual({
    error: "This product no longer exists.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("reports an unsuccessful API response without refreshing pages", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(null, { status: 500 }),
  );

  const result = await setProductActivation(2, false);

  expect(result).toEqual({
    error:
      "Status change could not be confirmed. Reload the product before retrying.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("handles a network failure without refreshing pages", async () => {
  fetchMock.mockRejectedValueOnce(
    new TypeError("Failed to fetch"),
  );

  const result = await setProductActivation(2, false);

  expect(result).toEqual({
    error:
      "Status change could not be confirmed. Reload the product before retrying.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test.each([
  {
    description: "invalid product data",
    payload: { data: null },
  },
  {
    description: "a different product",
    payload: {
      data: {
        id: 999,
        name: "Another Keyboard",
        sku: "OTHER-001",
        active: false,
      },
    },
  },
  {
    description: "the wrong activation state",
    payload: {
      data: {
        id: 2,
        name: "Ergonomic Keyboard",
        sku: "KEYBOARD-002",
        active: true,
      },
    },
  },
])("rejects $description without refreshing pages", async ({ payload }) => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await setProductActivation(2, false);

  expect(result).toEqual({
    error:
      "Status change could not be confirmed. Reload the product before retrying.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("handles malformed JSON without refreshing pages", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response('{"data":', {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await setProductActivation(2, false);

  expect(result).toEqual({
    error:
      "Status change could not be confirmed. Reload the product before retrying.",
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid product ID %s before requesting the API",
  async (productId) => {
    const result = await setProductActivation(productId, true);

    expect(result).toEqual({
      error: "Invalid product activation request.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  },
);

test("rejects a non-boolean activation state before requesting the API", async () => {
  // Deliberately simulate invalid input arriving at runtime.
  // @ts-expect-error The action must reject non-boolean runtime input.
  const result = await setProductActivation(2, "false");

  expect(result).toEqual({
    error: "Invalid product activation request.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("reports missing API configuration without requesting the API", async () => {
  vi.stubEnv("STOCKPILOT_API_URL", undefined);

  const result = await setProductActivation(2, true);

  expect(result).toEqual({
    error: "Product activation is unavailable.",
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});