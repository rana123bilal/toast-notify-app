export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left' | 'top-right' | 'top-center'
  | 'bottom-left' | 'bottom-right' | 'bottom-center';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  message: string | React.ReactNode;
  duration?: number | 'infinite';
  role?: 'status' | 'alert';
  icon?: React.ReactNode;
  action?: { label: string; onClick: (id: string) => void; ariaLabel?: string };
  onDismiss?: (id: string) => void;
}

export interface Toast extends Required<Pick<ToastOptions, 'message'>> {
  id: string;
  type: ToastType;
  duration: number | 'infinite';
  role: 'status' | 'alert';
  dismissed: boolean;
  createdAt: number;
  icon?: React.ReactNode;
  action?: ToastOptions['action'];
  onDismiss?: (id: string) => void;
}

export interface ToastConfig {
  position: ToastPosition;
  duration: number;       // default duration (ms)
  max: number;            // max visible
  closeOnClick: boolean;
  pauseOnHover: boolean;
}

export interface ToastApi {
  show: (message: ToastOptions['message'], opts?: Omit<ToastOptions, 'message'>) => string;
  success: ToastApi['show'];
  error: ToastApi['show'];
  warning: ToastApi['show'];
  info: ToastApi['show'];
  dismiss: (id: string) => void;
}
