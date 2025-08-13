/**
 * Toast behavior tests
 *
 * What this spec covers:
 * - Triggering toasts via the public API (useToast)
 * - Roles and aria-live behavior (a11y)
 * - Auto-dismiss timers (with fake timers)
 * - Pause on hover / resume on mouse leave
 * - Manual dismissal paths (close button, Esc key, click body when enabled)
 * - Stacking and max trimming
 * - Invoking action buttons and onDismiss callbacks
 *
 * Important note:
 * This suite asserts that a toast enters the "closing" state (data-state="closing")
 * rather than waiting for DOM removal. Your implementation currently marks a toast
 * as "closing" on dismiss; if you later wire onTransitionEnd to dispatch a REMOVE,
 * you can switch expectations to waitForElementToBeRemoved for stricter checks.
 */

import { render, screen, fireEvent, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "../provider/toast-provider";

/**
 * Returns the rendered toast viewport element.
 * We scope queries to the viewport to avoid accidentally matching
 * trigger buttons that live in the test harness.
 */
const viewport = () =>
  (document.body.querySelector(".rt-viewport") as HTMLElement) ?? undefined;

/**
 * Simulates the end of all CSS transitions that your toast uses for exit animations.
 * Your CSS transitions include opacity, max-height, transform, margin, and padding.
 * Firing transitionend for each property ensures the component gets the signal it expects
 * regardless of which property it listens to.
 */
const endAllTransitions = async (el: Element) => {
  const props = ["opacity", "max-height", "transform", "margin", "padding"];
  await act(async () => {
    for (const p of props) {
      fireEvent.transitionEnd(el, { propertyName: p } as any);
    }
  });
};

/**
 * Harness renders a minimal set of trigger buttons that call the toast API.
 * This keeps tests focused on behavior, not on app wiring.
 */
function Harness({
  providerConfig,
  onAction,
  onDismiss,
}: {
  providerConfig?: Partial<import("../core/types").ToastConfig>;
  onAction?: jest.Mock;
  onDismiss?: jest.Mock;
}) {
  const Triggers = () => {
    const toast = useToast();
    return (
      <div>
        {/* Basic success / error for role + aria-live coverage */}
        <button data-testid="succ" onClick={() => toast.success("Saved!")}>
          success
        </button>
        <button data-testid="err" onClick={() => toast.error("Oops!")}>
          error
        </button>

        {/* Toast with action button and onDismiss callback */}
        <button
          data-testid="action"
          onClick={() =>
            toast.show("With action", {
              duration: "infinite",
              action: { label: "Undo", onClick: () => onAction?.("undo") },
              onDismiss: (id) => onDismiss?.(id),
            })
          }
        >
          action
        </button>

        {/* Infinite toast used for manual dismissal tests */}
        <button
          data-testid="inf"
          onClick={() => toast.show("Stay", { duration: "infinite" })}
        >
          infinite
        </button>

        {/* Three long-lived toasts to exercise stacking + max trimming */}
        <button
          data-testid="A"
          onClick={() => toast.info("A", { duration: "infinite" })}
        >
          A
        </button>
        <button
          data-testid="B"
          onClick={() => toast.info("B", { duration: "infinite" })}
        >
          B
        </button>
        <button
          data-testid="C"
          onClick={() => toast.info("C", { duration: "infinite" })}
        >
          C
        </button>
      </div>
    );
  };

  return (
    <ToastProvider config={providerConfig}>
      <Triggers />
    </ToastProvider>
  );
}

describe("Toast behavior", () => {
  /**
   * We use fake timers to deterministically drive auto-dismiss timers.
   * Each test is responsible for advancing timers inside act().
   */
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Do not run pending timers automatically; tests control timing explicitly.
    jest.useRealTimers();
  });

  it("shows a success toast with correct a11y (role=status, polite)", async () => {
    render(<Harness providerConfig={{ duration: 3000 }} />);
    await userEvent.click(screen.getByTestId("succ"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Saved!").closest(".rt-toast")!;
    expect(toastEl).toBeInTheDocument();
    expect(toastEl).toHaveAttribute("role", "status");
    expect(toastEl).toHaveAttribute("aria-live", "polite");
    expect(toastEl).toHaveAttribute("data-state", "open");
  });

  it("error toast announces assertively (role=alert)", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByTestId("err"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Oops!").closest(".rt-toast")!;
    expect(toastEl).toHaveAttribute("role", "alert");
    expect(toastEl).toHaveAttribute("aria-live", "assertive");
  });

  it("auto-dismisses after duration by entering the closing state", async () => {
    render(<Harness providerConfig={{ duration: 1000 }} />);
    await userEvent.click(screen.getByTestId("succ"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Saved!").closest(".rt-toast")!;

    // Advance past the configured duration to trigger dismissal
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    // Simulate the end of exit animation
    await endAllTransitions(toastEl);

    // Current implementation marks "closing" rather than removing immediately
    expect(toastEl).toHaveAttribute("data-state", "closing");
    expect(toastEl.className).toMatch(/\bclosing\b/);
  });

  it("pauses auto-dismiss on hover and resumes after mouse leave", async () => {
    render(<Harness providerConfig={{ duration: 2000, pauseOnHover: true }} />);
    await userEvent.click(screen.getByTestId("succ"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Saved!").closest(".rt-toast") as HTMLElement;

    // Let half of the duration elapse
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Hover pauses the remaining timer
    await act(async () => {
      fireEvent.mouseEnter(toastEl);
      jest.advanceTimersByTime(5000);
    });
    expect(v.getByText("Saved!")).toBeInTheDocument();

    // Leaving resumes; finish remaining time
    await act(async () => {
      fireEvent.mouseLeave(toastEl);
      jest.advanceTimersByTime(1000);
    });

    await endAllTransitions(toastEl);
    expect(toastEl).toHaveAttribute("data-state", "closing");
  });

  it("manual dismiss via close button triggers closing", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByTestId("inf"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Stay").closest(".rt-toast")!;
    const close = toastEl.querySelector(".rt-close") as HTMLButtonElement;

    await userEvent.click(close);
    await endAllTransitions(toastEl);
    expect(toastEl).toHaveAttribute("data-state", "closing");
  });

  it("pressing Escape while focused dismisses and enters closing", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByTestId("inf"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Stay").closest(".rt-toast") as HTMLElement;

    toastEl.focus();
    await act(async () => {
      fireEvent.keyDown(toastEl, { key: "Escape" });
    });

    await endAllTransitions(toastEl);
    expect(toastEl).toHaveAttribute("data-state", "closing");
  });

  it("closeOnClick allows clicking the toast body to dismiss", async () => {
    render(<Harness providerConfig={{ closeOnClick: true }} />);
    await userEvent.click(screen.getByTestId("inf"));

    const v = within(viewport()!);
    const toastEl = v.getByText("Stay").closest(".rt-toast") as HTMLElement;

    await userEvent.click(toastEl);
    await endAllTransitions(toastEl);
    expect(toastEl).toHaveAttribute("data-state", "closing");
  });

  it("respects max stack size by dropping the oldest toast", async () => {
    render(<Harness providerConfig={{ max: 2 }} />);

    await userEvent.click(screen.getByTestId("A"));
    await userEvent.click(screen.getByTestId("B"));
    await userEvent.click(screen.getByTestId("C"));

    const v = within(viewport()!);
    expect(v.queryByText("A")).not.toBeInTheDocument();
    expect(v.getByText("B")).toBeInTheDocument();
    expect(v.getByText("C")).toBeInTheDocument();
  });

  it("invokes action button callback and calls onDismiss when closed", async () => {
    const onAction = jest.fn();
    const onDismiss = jest.fn();
    render(<Harness onAction={onAction} onDismiss={onDismiss} />);

    await userEvent.click(screen.getByTestId("action"));
    await userEvent.click(screen.getByRole("button", { name: /Undo/i }));
    expect(onAction).toHaveBeenCalledWith("undo");

    const v = within(viewport()!);
    const toastEl = v.getByText("With action").closest(".rt-toast")!;
    const close = toastEl.querySelector(".rt-close") as HTMLButtonElement;

    await userEvent.click(close);
    await endAllTransitions(toastEl);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
