import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OpenStatusBadge } from '../OpenStatusBadge';

describe('OpenStatusBadge', () => {
  afterEach(() => vi.useRealTimers());

  it('shows "Open now" when isOpenNow is true', () => {
    render(
      <OpenStatusBadge
        hours={[{ dow: 1, open: '10:00:00', close: '20:00:00', is_closed: false }]}
        isOpenNow
      />,
    );
    expect(screen.getByText(/Open now/i)).toBeInTheDocument();
  });

  it('shows "Opens at HH:MM" when today opens later', () => {
    // Fix clock to a known IST time before today's open. Use Monday 08:00 IST.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T02:30:00.000Z')); // 08:00 IST Monday
    render(
      <OpenStatusBadge
        hours={[
          { dow: 1, open: '10:00:00', close: '20:00:00', is_closed: false },
          { dow: 2, open: '10:00:00', close: '20:00:00', is_closed: false },
        ]}
        isOpenNow={false}
      />,
    );
    expect(screen.getByText(/Opens at 10:00/i)).toBeInTheDocument();
  });

  it('shows "Closed" when no hours are provided', () => {
    render(<OpenStatusBadge hours={[]} isOpenNow={false} />);
    expect(screen.getByText(/Closed/i)).toBeInTheDocument();
  });

  it('shows "Opens tomorrow at HH:MM" when today is closed but tomorrow is open', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T15:00:00.000Z')); // 20:30 IST Monday — past today's close
    render(
      <OpenStatusBadge
        hours={[
          { dow: 1, open: '10:00:00', close: '20:00:00', is_closed: false },
          { dow: 2, open: '11:00:00', close: '19:00:00', is_closed: false },
        ]}
        isOpenNow={false}
      />,
    );
    expect(screen.getByText(/Opens tomorrow at 11:00/i)).toBeInTheDocument();
  });
});
