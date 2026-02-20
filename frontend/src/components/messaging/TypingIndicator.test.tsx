import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingIndicator from './TypingIndicator';

describe('TypingIndicator', () => {
  it('should render with default user name', () => {
    render(<TypingIndicator />);

    expect(screen.getByText('Someone is typing...')).toBeInTheDocument();
  });

  it('should render with custom user name', () => {
    render(<TypingIndicator userName="John" />);

    expect(screen.getByText('John is typing...')).toBeInTheDocument();
  });

  it('should render animated dots', () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('should apply custom className', () => {
    const { container } = render(<TypingIndicator className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should apply different animation delays to dots', () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll('.animate-bounce');
    const delays = Array.from(dots).map(dot =>
      dot.getAttribute('style')?.match(/animation-delay:\s*(\d+)ms/)?.[1]
    );

    expect(delays[0]).toBe('0');
    expect(delays[1]).toBe('150');
    expect(delays[2]).toBe('300');
  });
});
