import ToastItem from './toast-item';
import type { Toast, ToastConfig } from '../core/types';

type Props = {
  toasts: Toast[];
  dismiss: (id: string) => void;
  remove: (id: string) => void;
  config: ToastConfig;
};

export default function ToastViewport({ toasts, dismiss, remove, config }: Props) {
  return (
    <div
      className={`rt-viewport pos-${config.position}`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          toast={t}
          dismiss={() => dismiss(t.id)}
          remove={() => remove(t.id)}
          config={config}
        />
      ))}
    </div>
  );
}
