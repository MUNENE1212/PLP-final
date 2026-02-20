import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceNotePlayer from './VoiceNotePlayer';

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  currentTime = 0;
  duration = 30;
  paused = true;

  addEventListener = vi.fn((event: string, callback: () => void) => {
    if (event === 'loadedmetadata') {
      // Simulate async loading
      setTimeout(callback, 0);
    }
  });

  removeEventListener = vi.fn();

  play = vi.fn().mockResolvedValue(undefined);

  pause = vi.fn();
}

// @ts-expect-error - Mocking global
global.Audio = MockAudio;

describe('VoiceNotePlayer', () => {
  const defaultProps = {
    audioUrl: 'https://example.com/audio.webm',
    duration: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render play button initially', async () => {
    render(<VoiceNotePlayer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTitle('Play')).toBeInTheDocument();
    });
  });

  it('should display duration', async () => {
    render(<VoiceNotePlayer {...defaultProps} duration={65} />);

    await waitFor(() => {
      expect(screen.getByText('1:05')).toBeInTheDocument();
    });
  });

  it('should display initial time as 0:00', async () => {
    render(<VoiceNotePlayer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  it('should toggle between play and pause', async () => {
    render(<VoiceNotePlayer {...defaultProps} />);

    await waitFor(() => {
      const playButton = screen.getByTitle('Play');
      fireEvent.click(playButton);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Pause')).toBeInTheDocument();
    });
  });

  it('should apply different styles for own messages', async () => {
    const { container } = render(<VoiceNotePlayer {...defaultProps} isOwn={true} />);

    await waitFor(() => {
      const button = screen.getByTitle('Play');
      expect(button).toHaveClass('bg-white/20');
    });
  });

  it('should apply different styles for other messages', async () => {
    const { container } = render(<VoiceNotePlayer {...defaultProps} isOwn={false} />);

    await waitFor(() => {
      const button = screen.getByTitle('Play');
      expect(button).toHaveClass('bg-primary');
    });
  });

  it('should accept custom className', async () => {
    const { container } = render(<VoiceNotePlayer {...defaultProps} className="custom-class" />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  it('should format time correctly', async () => {
    render(<VoiceNotePlayer {...defaultProps} duration={125} />);

    await waitFor(() => {
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });
  });
});
