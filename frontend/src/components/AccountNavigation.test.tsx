import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/getCurrentUser.server";
import { AccountNavigation } from "./AccountNavigation";

vi.mock("@/lib/getCurrentUser.server", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/app/logout-action", () => ({
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}));

vi.mock("./InventoryRealtime", () => ({
  InventoryRealtime: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("shows Sign in for an anonymous user", async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(null);

  render(await AccountNavigation());

  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/login",
  );
  expect(
    screen.queryByRole("button", { name: "Sign out" }),
  ).not.toBeInTheDocument();
});

it("shows the confirmed account and Sign out control", async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 1,
    email: "developer@example.com",
    roles: ["ROLE_USER"],
  });

  render(await AccountNavigation());

  expect(screen.getByText("developer@example.com")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  expect(
    screen.queryByRole("link", { name: "Sign in" }),
  ).not.toBeInTheDocument();
});

it("shows unavailable feedback when account lookup fails", async () => {
  vi.mocked(getCurrentUser).mockRejectedValue(
    new Error("Internal backend connection details"),
  );

  render(await AccountNavigation());

  expect(screen.getByRole("status")).toHaveTextContent(
    "Account temporarily unavailable.",
  );
  expect(
    screen.queryByText("Internal backend connection details"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Sign in" }),
  ).not.toBeInTheDocument();
});