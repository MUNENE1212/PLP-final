/**
 * ApprovalModal Component Tests
 *
 * Tests for the approval/rejection modal covering:
 * - Rendering with different action types
 * - Form validation
 * - Submit actions
 * - Accessibility
 * - Keyboard navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/setup';
import ApprovalModal from './ApprovalModal';
import type { PendingService } from '@/types/service';

// Mock service data
const mockService: PendingService = {
  _id: 'service_123',
  categoryId: 'plumbing',
  name: 'CUSTOM PIPE INSTALLATION',
  description: 'Installation of custom plumbing pipes for residential properties',
  icon: 'wrench',
  basePriceMin: 5000,
  basePriceMax: 15000,
  estimatedDuration: '4-8 hrs',
  isActive: false,
  isCustom: true,
  approvalStatus: 'pending',
  requestedBy: {
    _id: 'tech_123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  requestedAt: new Date().toISOString(),
};

describe('ApprovalModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnApprove = vi.fn().mockResolvedValue(undefined);
  const mockOnReject = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING TESTS
  // ============================================
  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ApprovalModal
          isOpen={false}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display service name in UPPERCASE', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText('CUSTOM PIPE INSTALLATION')).toBeInTheDocument();
    });

    it('should display service details', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText(mockService.description)).toBeInTheDocument();
      expect(screen.getByText(mockService.estimatedDuration)).toBeInTheDocument();
    });

    it('should display requester information', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/\(john@example.com\)/)).toBeInTheDocument();
    });
  });

  // ============================================
  // ACTION TYPE TESTS
  // ============================================
  describe('Action Types', () => {
    it('should show approve title for approve action', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText('Approve Service')).toBeInTheDocument();
    });

    it('should show reject title for reject action', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="reject"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText('Reject Service')).toBeInTheDocument();
    });

    it('should show optional label for approve action', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText('Approval Notes (optional)')).toBeInTheDocument();
    });

    it('should show required label for reject action', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="reject"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      expect(screen.getByText('Rejection Reason (required)')).toBeInTheDocument();
    });
  });

  // ============================================
  // FORM VALIDATION TESTS
  // ============================================
  describe('Form Validation', () => {
    it('should show error when rejecting without reason', async () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="reject"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const confirmButton = screen.getByRole('button', { name: 'Reject' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Rejection reason is required')).toBeInTheDocument();
      });
    });

    it('should not show error when approving without notes', async () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const confirmButton = screen.getByRole('button', { name: 'Approve' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith('service_123', undefined);
      });
    });

    it('should call onReject with reason when valid', async () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="reject"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Service does not meet quality standards' } });

      const confirmButton = screen.getByRole('button', { name: 'Reject' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnReject).toHaveBeenCalledWith('service_123', 'Service does not meet quality standards');
      });
    });
  });

  // ============================================
  // CLOSE BEHAVIOR TESTS
  // ============================================
  describe('Close Behavior', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when loading', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible close button', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should focus textarea when opened', async () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={false}
        />
      );

      const textarea = screen.getByRole('textbox');
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================
  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      const approveButton = screen.getByRole('button', { name: 'Approve' });

      expect(cancelButton).toBeDisabled();
      expect(approveButton).toBeDisabled();
    });

    it('should disable textarea when loading', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          service={mockService}
          action="approve"
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          isLoading={true}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });
});
