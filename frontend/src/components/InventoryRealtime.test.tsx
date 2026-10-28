import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { InventoryRealtime } from "./InventoryRealtime";

const mocks = vi.hoisted(() => ({
  router: { refresh: vi.fn() },
  fetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

class MockEventSource {
  static instances: MockEventSource[] = [];

  close = vi.fn();
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(
    public url: string,
    public options: EventSourceInit,
  ) {
    MockEventSource.instances.push(this);
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  MockEventSource.instances = [];

  vi.stubGlobal("fetch", mocks.fetch);
  vi.stubGlobal("EventSource", MockEventSource);

  mocks.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        hubUrl: "http://127.0.0.1:8081/.well-known/mercure",
        topic: "urn:stockpilot:inventory",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("authorizes, connects with credentials, and closes on unmount", async () => {
  const view = render(<InventoryRealtime />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

  expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(
    "/api/realtime/authorize",
    expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      signal: expect.any(AbortSignal),
    }),
  );

  expect(MockEventSource.instances).toHaveLength(1);

  const source = MockEventSource.instances[0];
  const url = new URL(source.url);

  expect(url.origin).toBe("http://127.0.0.1:8081");
  expect(url.pathname).toBe("/.well-known/mercure");
  expect(url.searchParams.get("match")).toBe("urn:stockpilot:inventory");
  expect(url.searchParams.has("topic")).toBe(false);
  expect(source.options).toEqual({ withCredentials: true });

  view.unmount();

  expect(source.close).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it("groups rapid inventory events into one refresh", async () => {
  render(<InventoryRealtime />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

  const source = MockEventSource.instances[0];

  const event = new MessageEvent("message", {
    data: JSON.stringify({
      type: "inventory.changed",
      productId: 1,
      movementId: 15,
    }),
  });

  act(() => {
    source.onmessage?.(event);
    source.onmessage?.(event);
    source.onmessage?.(event);
  });

  expect(mocks.router.refresh).not.toHaveBeenCalled();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(250);
  });

  expect(mocks.router.refresh).toHaveBeenCalledOnce();
});

it("renews authorization before the credential expires", async () => {
  render(<InventoryRealtime />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

  const firstSource = MockEventSource.instances[0];

  await act(async () => {
    await vi.advanceTimersByTimeAsync(44_999);
  });

  expect(mocks.fetch).toHaveBeenCalledTimes(1);
  expect(firstSource.close).not.toHaveBeenCalled();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });

  expect(mocks.fetch).toHaveBeenCalledTimes(2);
  expect(firstSource.close).toHaveBeenCalledOnce();
  expect(MockEventSource.instances).toHaveLength(2);
  expect(MockEventSource.instances[1].options).toEqual({
    withCredentials: true,
  });
});

it("reauthorizes after a stream error and refreshes on reconnection", async () => {
  render(<InventoryRealtime />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

  const firstSource = MockEventSource.instances[0];

  act(() => {
    firstSource.onerror?.();
  });

  expect(firstSource.close).toHaveBeenCalledOnce();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(4_999);
  });

  expect(mocks.fetch).toHaveBeenCalledTimes(1);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });

  expect(mocks.fetch).toHaveBeenCalledTimes(2);
  expect(MockEventSource.instances).toHaveLength(2);

  const secondSource = MockEventSource.instances[1];

  act(() => {
    secondSource.onopen?.();
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(250);
  });

  expect(mocks.router.refresh).toHaveBeenCalledOnce();
});

it.each([401, 403])(
  "stops retrying when authorization returns %s",
  async (status) => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      status,
    });

    render(<InventoryRealtime />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mocks.router.refresh).toHaveBeenCalledOnce();
    expect(MockEventSource.instances).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70_000);
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  },
);

it.each(["refresh", "retry"])(
  "cancels a pending %s when unmounted",
  async (pending) => {
    const view = render(<InventoryRealtime />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const source = MockEventSource.instances[0];

    act(() => {
      if (pending === "refresh") {
        source.onopen?.();
      } else {
        source.onerror?.();
      }
    });

    view.unmount();

    expect(vi.getTimerCount()).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70_000);
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.router.refresh).not.toHaveBeenCalled();
  },
);