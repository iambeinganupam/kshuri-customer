import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewCard } from '../ReviewCard';

const baseReview = {
  id: 'r1',
  author_name: 'Aisha',
  rating: 5,
  title: 'Loved it',
  comment: 'Great service, will return.',
  photos: [],
  helpful_count: 3,
  vendor_reply: null,
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('ReviewCard', () => {
  it('renders author + title + comment + helpful count', () => {
    render(<ReviewCard review={baseReview} onHelpful={vi.fn()} onReport={vi.fn()} isOwn={false} />);
    expect(screen.getByText('Aisha')).toBeInTheDocument();
    expect(screen.getByText('Loved it')).toBeInTheDocument();
    expect(screen.getByText(/Great service/)).toBeInTheDocument();
    expect(screen.getByText(/Helpful/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('calls onHelpful when the helpful button is clicked', () => {
    const onHelpful = vi.fn();
    render(<ReviewCard review={baseReview} onHelpful={onHelpful} onReport={vi.fn()} isOwn={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Helpful/i }));
    expect(onHelpful).toHaveBeenCalledWith('r1');
  });

  it('hides the Report menu item when isOwn=true', () => {
    render(<ReviewCard review={baseReview} onHelpful={vi.fn()} onReport={vi.fn()} isOwn />);
    expect(screen.queryByRole('menuitem', { name: /Report/i })).not.toBeInTheDocument();
  });

  it('shows a "Read more" toggle when comment exceeds 240 chars', () => {
    const long = 'x'.repeat(260);
    render(
      <ReviewCard
        review={{ ...baseReview, comment: long }}
        onHelpful={vi.fn()}
        onReport={vi.fn()}
        isOwn={false}
      />,
    );
    expect(screen.getByRole('button', { name: /Read more/i })).toBeInTheDocument();
  });

  it('renders the vendor reply when present', () => {
    render(
      <ReviewCard
        review={{ ...baseReview, vendor_reply: 'Thanks for visiting!' }}
        onHelpful={vi.fn()}
        onReport={vi.fn()}
        isOwn={false}
      />,
    );
    expect(screen.getByText(/Vendor reply/i)).toBeInTheDocument();
    expect(screen.getByText('Thanks for visiting!')).toBeInTheDocument();
  });
});
