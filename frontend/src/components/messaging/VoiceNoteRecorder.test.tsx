import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VoiceNoteRecorder from './VoiceNoteRecorder';

// Mock MediaRecorder (plain class — not affected by mockReset)
class MockMediaRecorder {
  static isTypeSupported = (_mimeType: string) => true;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';
  mimeType = 'audio/webm';

  constructor(_stream: MediaStream, _options?: { mimeType?: string }) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

// Mock AudioContext (plain class)
class MockAudioContext {
  state = 'running';
  createMediaStreamSource = () => ({ connect: () => {} });
  createAnalyser = () => ({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: () => {},
  });
  close = () => {};
}

// @ts-expect-error - Mocking global
global.MediaRecorder = MockMediaRecorder;
// @ts-expect-error - Mocking global
global.AudioContext = MockAudioContext;

// Mock URL.createObjectURL
global.URL.createObjectURL = () => 'blob:mock-url';
global.URL.revokeObjectURL = () => {};

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(0), 0) as unknown as number;
};
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

describe('VoiceNoteRecorder', () => {
  const mockOnSend = vi.fn();
  const mockOnCancel = vi.fn();

  const mockStream = {
    getTracks: () => [{ stop: () => {} }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-establish getUserMedia mock (survives mockReset)
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: () => Promise.resolve(mockStream),
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render initial state with record button', () => {
    render(<VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} />);

    expect(screen.getByText('Tap to record voice message')).toBeInTheDocument();
    expect(screen.getByText('Max 60 seconds')).toBeInTheDocument();
  });

  it('should start recording when record button is clicked', async () => {
    render(<VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} />);

    const recordButton = screen.getByTitle('Record voice message');
    await act(async () => {
      fireEvent.click(recordButton);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Stop recording')).toBeInTheDocument();
    });
  });

  it('should show cancel button during recording', async () => {
    render(<VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} />);

    const recordButton = screen.getByTitle('Record voice message');
    await act(async () => {
      fireEvent.click(recordButton);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Cancel')).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel is clicked during recording', async () => {
    render(<VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} />);

    // Start recording
    const recordButton = screen.getByTitle('Record voice message');
    await act(async () => {
      fireEvent.click(recordButton);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Cancel')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should use custom maxDuration', () => {
    render(<VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} maxDuration={30} />);

    expect(screen.getByText('Max 30 seconds')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(
      <VoiceNoteRecorder onSend={mockOnSend} onCancel={mockOnCancel} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
