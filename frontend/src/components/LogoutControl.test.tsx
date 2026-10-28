import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { LogoutState } from "@/types/logout";
import { LogoutControl } from "./LogoutControl";

it("displays feedback when logout cannot be confirmed", async () => {
  const user = userEvent.setup();
  const action = vi.fn().mockResolvedValue({
    error: "Sign out could not be confirmed. Please try again.",
  });

  render(<LogoutControl action={action} />);

  await user.click(screen.getByRole("button", { name: "Sign out" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Sign out could not be confirmed. Please try again.",
  );
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
});

it("disables submission while logout is pending", async () => {
  const user = userEvent.setup();

  let completeLogout!: (state: LogoutState) => void;

  const action = vi.fn(
    () =>
      new Promise<LogoutState>((resolve) => {
        completeLogout = resolve;
      }),
  );

  render(<LogoutControl action={action} />);

  await user.click(screen.getByRole("button", { name: "Sign out" }));

  expect(
    screen.getByRole("button", { name: "Signing out…" }),
  ).toBeDisabled();

  await act(async () => {
    completeLogout({ error: "Please try again." });
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please try again.",
  );
  expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  expect(action).toHaveBeenCalledTimes(1);
});
