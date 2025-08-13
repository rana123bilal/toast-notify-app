import type { Toast } from "./types";

type State = { toasts: Toast[] };
type Action =
  | { type: "ADD"; toast: Toast; max: number }
  | { type: "DISMISS"; id: string }
  | { type: "REMOVE"; id: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const next = [...state.toasts, action.toast];
      const trimmed =
        next.length > action.max ? next.slice(next.length - action.max) : next;
      return { toasts: trimmed };
    }
    case "DISMISS":
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, dismissed: true } : t
        ),
      };
    case "REMOVE":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}
