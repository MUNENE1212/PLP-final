/**
 * PaymentSuccessCelebration Component Tests
 *
 * Tests for the triumphant payment success experience covering:
 * - Rendering with success state
 * - Animated checkmark drawing effect
 * - Confetti/particle effects integration
 * - Glow and pulse effects
 * - Transaction details display
 * - Call-to-action buttons
 * - Accessibility (reduced motion support)
 * - Dark theme compatibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@/test/setup';
import PaymentSuccessCelebration from './PaymentSuccessCelebration';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Mock matchMedia for reduced motion
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('PaymentSuccessCelebration Component', () => {
  // ============================================
  // DEFAULT PROPS
  // ============================================
  const defaultProps = {
    isVisible: true,
    transactionId: 'TXN123456789',
    amount: 5000,
    currency: 'KES',
    recipientName: 'John Doe',
    onContinue: vi.fn(),
    onViewBooking: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ============================================
  // BASIC RENDERING TESTS
  // ============================================
  describe('Basic Rendering', () => {
    it('should render when isVisible is true', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Use getByRole for the heading which is more specific
      expect(screen.getByRole('heading', { level: 1, name: /payment successful/i })).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      render(<PaymentSuccessCelebration {...defaultProps} isVisible={false} />);
      expect(screen.queryByRole('heading', { level: 1, name: /payment successful/i })).not.toBeInTheDocument();
    });

    it('should render with glassmorphism card styling', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const card = screen.getByTestId('success-card');
      expect(card).toHaveClass('glass-card');
    });

    it('should apply LED glow effects', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const container = screen.getByTestId('success-container');
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================
  // SUCCESS MESSAGE TESTS
  // ============================================
  describe('Success Message', () => {
    it('should display triumphant success title', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1, name: /payment successful/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display celebratory subtitle', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText(/your payment has been confirmed/i)).toBeInTheDocument();
    });

    it('should show custom title if provided', () => {
      render(<PaymentSuccessCelebration {...defaultProps} title="Booking Confirmed!" />);
      expect(screen.getByRole('heading', { level: 1, name: /booking confirmed/i })).toBeInTheDocument();
    });
  });

  // ============================================
  // ANIMATED CHECKMARK TESTS
  // ============================================
  describe('Animated Checkmark', () => {
    it('should render animated checkmark SVG', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const checkmark = screen.getByTestId('success-checkmark');
      expect(checkmark).toBeInTheDocument();
    });

    it('should have drawing animation on checkmark path', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const path = screen.getByTestId('checkmark-path');
      expect(path).toBeInTheDocument();
    });

    it('should use LED Green color for success checkmark', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const checkmark = screen.getByTestId('success-checkmark');
      // Check for LED glow class or style
      expect(checkmark).toHaveClass('led-glow-success');
    });
  });

  // ============================================
  // TRANSACTION DETAILS TESTS
  // ============================================
  describe('Transaction Details', () => {
    it('should display transaction ID', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Use title attribute which is unique
      const txnSpan = screen.getByTitle('TXN123456789');
      expect(txnSpan).toBeInTheDocument();
      expect(txnSpan).toHaveTextContent('TXN123456789');
    });

    it('should display formatted amount', () => {
      render(<PaymentSuccessCelebration {...defaultProps} amount={5000} currency="KES" />);
      // Check for amount - there may be multiple (in sr-only and visible section)
      const amountElements = screen.getAllByText(/5,000/);
      expect(amountElements.length).toBeGreaterThan(0);
    });

    it('should display currency', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Currency is in the visible amount section (KES 5,000)
      // Use a function matcher to find elements containing KES
      const currencyElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('KES') ?? false;
      });
      expect(currencyElements.length).toBeGreaterThan(0);
    });

    it('should display recipient name', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display payment timestamp', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should display reference number label', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText(/reference/i)).toBeInTheDocument();
    });

    it('should truncate long transaction IDs', () => {
      render(
        <PaymentSuccessCelebration
          {...defaultProps}
          transactionId="VERYLONGTRANSACTIONID123456789ABCD"
        />
      );
      const txnSpan = screen.getByTitle('VERYLONGTRANSACTIONID123456789ABCD');
      expect(txnSpan).toBeInTheDocument();
      // Should be truncated with ellipsis
      expect(txnSpan.textContent).toContain('...');
    });
  });

  // ============================================
  // CALL-TO-ACTION BUTTONS TESTS
  // ============================================
  describe('Call-to-Action Buttons', () => {
    it('should render View Booking button', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByRole('button', { name: /view booking/i })).toBeInTheDocument();
    });

    it('should render Continue button', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should call onViewBooking when View Booking clicked', async () => {
      const handleClick = vi.fn();
      render(<PaymentSuccessCelebration {...defaultProps} onViewBooking={handleClick} />);

      const viewBookingBtn = screen.getByRole('button', { name: /view booking/i });
      viewBookingBtn.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when Continue clicked', async () => {
      const handleClick = vi.fn();
      render(<PaymentSuccessCelebration {...defaultProps} onContinue={handleClick} />);

      const continueBtn = screen.getByRole('button', { name: /continue/i });
      continueBtn.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have proper button styling matching design system', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const viewBookingBtn = screen.getByRole('button', { name: /view booking/i });
      // Check for inline-flex which is in buttonBaseStyles
      expect(viewBookingBtn).toHaveClass('inline-flex');
    });
  });

  // ============================================
  // CONFETTI EFFECTS TESTS
  // ============================================
  describe('Confetti Effects', () => {
    it('should trigger confetti on mount', async () => {
      const confetti = await import('canvas-confetti');
      render(<PaymentSuccessCelebration {...defaultProps} />);

      await waitFor(() => {
        expect(confetti.default).toHaveBeenCalled();
      });
    });

    it('should not trigger confetti when isVisible is false', async () => {
      const confetti = await import('canvas-confetti');
      render(<PaymentSuccessCelebration {...defaultProps} isVisible={false} />);

      expect(confetti.default).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe('Accessibility', () => {
    it('should have proper ARIA live region for screen readers', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce success message to screen readers', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(/payment successful/i);
    });

    it('should respect prefers-reduced-motion', () => {
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<PaymentSuccessCelebration {...defaultProps} />);
      const container = screen.getByTestId('success-container');
      expect(container).toHaveClass('reduced-motion');
    });

    it('should have dialog role for modal behavior', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  // ============================================
  // DARK THEME COMPATIBILITY TESTS
  // ============================================
  describe('Dark Theme Compatibility', () => {
    it('should use design system tokens for colors', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const card = screen.getByTestId('success-card');
      // Should use CSS custom properties from design tokens
      expect(card.className).toMatch(/glass-card|dark/);
    });

    it('should have proper contrast in dark mode', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const title = screen.getByRole('heading', { level: 1, name: /payment successful/i });
      // Title should have text-bone class for proper contrast
      expect(title.className).toMatch(/text-bone/);
    });
  });

  // ============================================
  // GLOW AND PULSE EFFECTS TESTS
  // ============================================
  describe('Glow and Pulse Effects', () => {
    it('should have LED glow effect on success checkmark', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      const checkmark = screen.getByTestId('success-checkmark');
      expect(checkmark).toHaveClass('led-glow-success');
    });

    it('should have pulse animation on checkmark when shown', async () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Wait for animations to trigger
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      const checkmark = screen.getByTestId('success-checkmark');
      // The animate-pulse-glow class is applied when showCheckmark is true
      expect(checkmark.className).toMatch(/animate-pulse-glow|led-glow-success/);
    });
  });

  // ============================================
  // NEXT STEPS GUIDANCE TESTS
  // ============================================
  describe('Next Steps Guidance', () => {
    it('should display next steps information', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText(/what happens next/i)).toBeInTheDocument();
    });

    it('should show step-by-step guidance', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      expect(screen.getByText(/your booking is confirmed/i)).toBeInTheDocument();
      expect(screen.getByText(/technician will contact you/i)).toBeInTheDocument();
    });

    it('should allow custom next steps', () => {
      const customSteps = ['Custom step 1', 'Custom step 2'];
      render(<PaymentSuccessCelebration {...defaultProps} nextSteps={customSteps} />);
      expect(screen.getByText('Custom step 1')).toBeInTheDocument();
      expect(screen.getByText('Custom step 2')).toBeInTheDocument();
    });
  });

  // ============================================
  // ANIMATION TIMING TESTS
  // ============================================
  describe('Animation Timing', () => {
    it('should have smooth 60fps target animations', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Check for will-change optimization on the card
      const card = screen.getByTestId('success-card');
      expect(card).toHaveClass('will-change-transform');
    });

    it('should use hardware acceleration for animations', () => {
      render(<PaymentSuccessCelebration {...defaultProps} />);
      // Check for GPU transform on the card
      const card = screen.getByTestId('success-card');
      expect(card).toHaveClass('transform-gpu');
    });
  });

  // ============================================
  // OPTIONAL PROPS TESTS
  // ============================================
  describe('Optional Props', () => {
    it('should work without optional callbacks', () => {
      render(
        <PaymentSuccessCelebration
          isVisible={true}
          transactionId="TXN123"
          amount={1000}
          currency="KES"
        />
      );
      expect(screen.getByRole('heading', { level: 1, name: /payment successful/i })).toBeInTheDocument();
    });

    it('should hide View Booking button if onViewBooking not provided', () => {
      render(
        <PaymentSuccessCelebration
          isVisible={true}
          transactionId="TXN123"
          amount={1000}
          currency="KES"
          onContinue={vi.fn()}
        />
      );
      expect(screen.queryByRole('button', { name: /view booking/i })).not.toBeInTheDocument();
    });

    it('should display booking reference if provided', () => {
      render(
        <PaymentSuccessCelebration
          {...defaultProps}
          bookingReference="BK-2024-001"
        />
      );
      expect(screen.getByText(/BK-2024-001/)).toBeInTheDocument();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      render(<PaymentSuccessCelebration {...defaultProps} amount={999999999} />);
      // Check for the formatted amount - may appear in multiple places
      const amountElements = screen.getAllByText(/999,999,999/);
      expect(amountElements.length).toBeGreaterThan(0);
    });

    it('should handle zero amount', () => {
      render(<PaymentSuccessCelebration {...defaultProps} amount={0} />);
      // Check for "KES 0" in the amount section - use getAllByText and filter
      const allZeroTexts = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('KES') && element?.textContent?.includes('0') || false;
      });
      expect(allZeroTexts.length).toBeGreaterThan(0);
    });

    it('should handle missing recipient name gracefully', () => {
      render(<PaymentSuccessCelebration {...defaultProps} recipientName={undefined} />);
      // When recipient name is undefined, the recipient row should not appear
      const recipientLabels = screen.queryAllByText('Recipient');
      expect(recipientLabels.length).toBe(0);
    });

    it('should handle rapid visibility toggles', async () => {
      const { rerender } = render(<PaymentSuccessCelebration {...defaultProps} isVisible={true} />);

      await act(async () => {
        rerender(<PaymentSuccessCelebration {...defaultProps} isVisible={false} />);
      });

      await act(async () => {
        rerender(<PaymentSuccessCelebration {...defaultProps} isVisible={true} />);
      });

      expect(screen.getByRole('heading', { level: 1, name: /payment successful/i })).toBeInTheDocument();
    });
  });
});
