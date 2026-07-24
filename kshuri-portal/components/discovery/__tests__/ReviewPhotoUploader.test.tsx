import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewPhotoUploader } from '../ReviewPhotoUploader';

// Mock createImageBitmap globally — jsdom doesn't implement it.
beforeAll(() => {
  globalThis.createImageBitmap = vi.fn(async () => ({
    width: 2000,
    height: 1000,
    close: () => {},
  })) as unknown as typeof createImageBitmap;
  // OffscreenCanvas mock — just enough to satisfy the resize path.
  // @ts-expect-error jsdom polyfill
  globalThis.OffscreenCanvas = class {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return {
        drawImage: vi.fn(),
      };
    }
    convertToBlob() {
      return Promise.resolve(new Blob(['x'], { type: 'image/jpeg' }));
    }
  };
});

describe('ReviewPhotoUploader', () => {
  it('renders an Add photo tile when value is empty', () => {
    render(
      <ReviewPhotoUploader
        value={[]}
        onChange={vi.fn()}
        uploadAdapter={async () => 'https://cdn/uploaded.jpg'}
      />,
    );
    expect(screen.getByText(/Add photo/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 5/)).toBeInTheDocument();
  });

  it('renders existing thumbnails + remove buttons', () => {
    const onChange = vi.fn();
    render(
      <ReviewPhotoUploader
        value={[
          { url: 'https://cdn/a.jpg', w: 800, h: 600 },
          { url: 'https://cdn/b.jpg', w: 800, h: 600 },
        ]}
        onChange={onChange}
        uploadAdapter={async () => 'https://cdn/x.jpg'}
      />,
    );
    const removes = screen.getAllByRole('button', { name: /Remove photo/i });
    expect(removes).toHaveLength(2);
    fireEvent.click(removes[0]);
    expect(onChange).toHaveBeenCalledWith([{ url: 'https://cdn/b.jpg', w: 800, h: 600 }]);
  });

  it('hides Add tile and shows "Maximum reached" when 5/5', () => {
    render(
      <ReviewPhotoUploader
        value={Array.from({ length: 5 }, (_, i) => ({ url: `https://cdn/${i}.jpg`, w: 800, h: 600 }))}
        onChange={vi.fn()}
        uploadAdapter={async () => 'https://cdn/x.jpg'}
      />,
    );
    expect(screen.queryByText(/Add photo/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Maximum reached/i)).toBeInTheDocument();
  });

  it('calls uploadAdapter + onChange when a file is dropped', async () => {
    const onChange = vi.fn();
    const upload = vi.fn(async () => 'https://cdn/new.jpg');
    render(
      <ReviewPhotoUploader
        value={[]}
        onChange={onChange}
        uploadAdapter={upload}
      />,
    );
    const dropzone = screen.getByTestId('review-photo-dropzone');
    const file = new File(['fake-png-bytes'], 'photo.png', { type: 'image/png' });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });
    // The async resize+upload happens via microtasks; wait for the next tick.
    await new Promise((r) => setTimeout(r, 0));
    expect(upload).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ url: 'https://cdn/new.jpg' }),
    ]);
  });

  it('ignores non-image files', async () => {
    const onChange = vi.fn();
    const upload = vi.fn(async () => 'https://cdn/x.jpg');
    render(
      <ReviewPhotoUploader
        value={[]}
        onChange={onChange}
        uploadAdapter={upload}
      />,
    );
    const dropzone = screen.getByTestId('review-photo-dropzone');
    const file = new File(['bytes'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    await new Promise((r) => setTimeout(r, 0));
    expect(upload).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
