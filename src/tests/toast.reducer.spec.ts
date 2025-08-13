import { reducer } from '../core/reducer';
import type { Toast } from '../core/types';

const t = (id: string): Toast => ({
  id,
  type: 'info',
  message: id,
  duration: 3000,
  role: 'status',
  dismissed: false,
  createdAt: Date.now(),
});

describe('toast reducer', () => {
  it('ADD respects max (drops oldest)', () => {
    const s1 = reducer({ toasts: [] }, { type: 'ADD', toast: t('1'), max: 2 });
    const s2 = reducer(s1, { type: 'ADD', toast: t('2'), max: 2 });
    const s3 = reducer(s2, { type: 'ADD', toast: t('3'), max: 2 });
    expect(s3.toasts.map(x => x.id)).toEqual(['2', '3']);
  });

  it('DISMISS toggles dismissed', () => {
    const s1 = reducer({ toasts: [] }, { type: 'ADD', toast: t('x'), max: 5 });
    const s2 = reducer(s1, { type: 'DISMISS', id: 'x' });
    expect(s2.toasts[0].dismissed).toBe(true);
  });

  it('REMOVE deletes toast', () => {
    const s1 = reducer({ toasts: [] }, { type: 'ADD', toast: t('x'), max: 5 });
    const s2 = reducer(s1, { type: 'REMOVE', id: 'x' });
    expect(s2.toasts).toHaveLength(0);
  });
});
