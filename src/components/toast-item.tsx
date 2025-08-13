import React, { useEffect, useRef } from 'react';
import type { Toast, ToastConfig } from '../core/types';

type Props = {
  toast: Toast;
  dismiss: () => void;
  remove: () => void;
  config: ToastConfig;
};

export default function ToastItem({ toast, dismiss, remove, config }: Props) {
  const { id, type, message, duration, dismissed, icon, action, role } = toast;

  const isInfinite = duration === 'infinite';
  const timerRef = useRef<number | undefined>(undefined);
  const remainingRef = useRef<number>(isInfinite ? Number.POSITIVE_INFINITY : (duration as number));
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    if (isInfinite) return;
    timerRef.current = window.setTimeout(dismiss, remainingRef.current);
    return () => window.clearTimeout(timerRef.current);
  }, [isInfinite, dismiss]);

  const pause = () => {
    if (!config.pauseOnHover || isInfinite) return;
    window.clearTimeout(timerRef.current);
    const elapsed = performance.now() - startRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  };
  const resume = () => {
    if (!config.pauseOnHover || isInfinite) return;
    startRef.current = performance.now();
    timerRef.current = window.setTimeout(dismiss, remainingRef.current);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') dismiss();
    if (config.closeOnClick && (e.key === 'Enter' || e.key === ' ')) dismiss();
  };

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (dismissed && e.propertyName === 'opacity') remove();
  };

  return (
    <div
      className={`rt-toast ${type} ${dismissed ? 'closing' : 'open'}`}
      data-type={type}
      data-state={dismissed ? 'closing' : 'open'}
      role={role}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTransitionEnd={onTransitionEnd}
      onClick={() => { if (config.closeOnClick) dismiss(); }}
    >
      <div className="rt-content">
        {icon ? <span className="rt-icon" aria-hidden>{icon}</span> : null}
        <div className="rt-message">{message}</div>
        {action ? (
          <button
            className="rt-action"
            onClick={(e) => { e.stopPropagation(); action.onClick(id); }}
            aria-label={action.ariaLabel ?? action.label}
          >
            {action.label}
          </button>
        ) : null}
        <button
          className="rt-close"
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
