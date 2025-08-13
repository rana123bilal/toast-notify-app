import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../provider/toast-provider';
import { useToast } from '../toastlib';
import userEvent from '@testing-library/user-event';

function App() {
  const toast = useToast();
  return <button onClick={() => toast.info('Hi')}>go</button>;
}

describe('a11y + config', () => {
  it('viewport has live region and region role', async () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('go'));

    const viewport = document.body.querySelector('.rt-viewport') as HTMLElement;
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute('role', 'region');
    expect(viewport).toHaveAttribute('aria-live', 'polite');
    expect(viewport).toHaveAttribute('aria-atomic', 'false');
  });

  it('applies position class from config', () => {
    render(
      <ToastProvider config={{ position: 'top-center', duration: 1000, max: 4, pauseOnHover: true, closeOnClick: true }}>
        <div />
      </ToastProvider>
    );
    const viewport = document.body.querySelector('.rt-viewport') as HTMLElement;
    expect(viewport.className).toMatch(/pos-top-center/);
  });
});
