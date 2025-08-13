import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { createPortal } from 'react-dom';
import { DEFAULTS } from '../core/constants';
import { reducer } from '../core/reducer';
import type { Toast, ToastApi, ToastConfig, ToastOptions } from '../core/types';
import ToastViewport from '../components/toast-viewport';

const Ctx = createContext<{ api: ToastApi } | null>(null);
let idCounter = 0;
const nextId = () => `${++idCounter}`;

export type ToastProviderProps = {
  children: React.ReactNode;
  config?: Partial<ToastConfig>;
};

export function ToastProvider({ children, config }: ToastProviderProps) {
  const merged: ToastConfig = { ...DEFAULTS, ...config };
  const [state, dispatch] = useReducer(reducer, { toasts: [] as Toast[] });

  const add = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? nextId();
    const toast: Toast = {
      id,
      type: opts.type ?? 'info',
      message: opts.message,
      duration: opts.duration === 'infinite' ? 'infinite' : (opts.duration ?? merged.duration),
      role: opts.type === 'error' ? 'alert' : (opts.role ?? 'status'),
      dismissed: false,
      createdAt: Date.now(),
      icon: opts.icon,
      action: opts.action,
      onDismiss: opts.onDismiss,
    };
    dispatch({ type: 'ADD', toast, max: merged.max });
    return id;
  }, [merged.duration, merged.max]);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', id });
    const t = state.toasts.find(x => x.id === id);
    t?.onDismiss?.(id);
  }, [state.toasts]);

  const remove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const api: ToastApi = useMemo(() => ({
    show: (message, opts = {}) => add({ ...opts, message }),
    success: (message, opts = {}) => add({ ...opts, type: 'success', message }),
    error:   (message, opts = {}) => add({ ...opts, type: 'error',   message }),
    warning: (message, opts = {}) => add({ ...opts, type: 'warning', message }),
    info:    (message, opts = {}) => add({ ...opts, type: 'info',    message }),
    dismiss,
  }), [add, dismiss]);

  return (
    <Ctx.Provider value={{ api }}>
      {children}
      {createPortal(
        <ToastViewport
          toasts={state.toasts}
          dismiss={dismiss}
          remove={remove}
          config={merged}
        />,
        document.body
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.api;
}
