/**
 * EscrowStatusCard Component
 *
 * Visual status card showing escrow details including:
 * - Current status with icon
 * - Amount breakdown (total, fee, payout)
 * - Timeline of events
 * - Action buttons (release, refund, dispute)
 *
 * @module components/escrow/EscrowStatusCard
 */

import React from 'react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EscrowTimer } from './EscrowTimer';
import type {
  Escrow,
  EscrowStatus,
  EscrowUser,
  EscrowBooking,
  EscrowHistoryEntry
} from '@/types/escrow';
import {
  ESCROW_STATUS_LABELS,
  ESCROW_STATUS_COLORS
} from '@/types/escrow';
import { formatKES, getStatusColorClasses } from '@/services/escrow.service';

interface EscrowStatusCardProps {
  /** Escrow data */
  escrow: Escrow;
  /** Current user's role */
  userRole: 'customer' | 'technician' | 'admin' | 'support';
  /** Callback when release is clicked */
  onRelease?: () => void;
  /** Callback when refund is clicked */
  onRefund?: () => void;
  /** Callback when dispute is clicked */
  onDispute?: () => void;
  /** Callback to view booking details */
  onViewBooking?: () => void;
  /** Is update in progress */
  isUpdating?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status Icon Component
 */
const StatusIcon: React.FC<{ status: EscrowStatus; className?: string }> = ({
  status,
  className
}) => {
  const icons: Record<EscrowStatus, React.ReactNode> = {
    pending: <PendingIcon className={className} />,
    funded: <FundedIcon className={className} />,
    partial_release: <PartialIcon className={className} />,
    released: <ReleasedIcon className={className} />,
    refunded: <RefundedIcon className={className} />,
    disputed: <DisputedIcon className={className} />,
    cancelled: <CancelledIcon className={className} />
  };

  return <>{icons[status]}</>;
};

/**
 * EscrowStatusCard Component
 */
export const EscrowStatusCard: React.FC<EscrowStatusCardProps> = ({
  escrow,
  userRole,
  onRelease,
  onRefund,
  onDispute,
  onViewBooking,
  isUpdating = false,
  className
}) => {
  const statusColors = getStatusColorClasses(escrow.status);
  const booking = escrow.booking as EscrowBooking;
  const customer = escrow.customer as EscrowUser;
  const technician = escrow.technician as EscrowUser;

  // Determine available actions
  const canRelease = escrow.canRelease &&
    (userRole === 'customer' || userRole === 'admin' || userRole === 'support');
  const canRefund = escrow.canRefund &&
    (userRole === 'admin' || userRole === 'support');
  const canDispute = escrow.canDispute &&
    (userRole === 'customer' || userRole === 'technician');

  // Get latest history entry
  const latestHistory = escrow.history[escrow.history.length - 1];

  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Status Banner */}
      <div
        className={clsx(
          'px-6 py-4 border-b',
          statusColors.bg,
          statusColors.border
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon
              status={escrow.status}
              className={clsx('h-6 w-6', statusColors.text)}
            />
            <div>
              <h3
                className={clsx(
                  'text-lg font-semibold',
                  statusColors.text
                )}
              >
                {ESCROW_STATUS_LABELS[escrow.status]}
              </h3>
              {booking?.bookingNumber && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Booking: {booking.bookingNumber}
                </p>
              )}
            </div>
          </div>

          {/* Timer if active */}
          {escrow.isActive && escrow.expiresAt && (
            <EscrowTimer expiresAt={escrow.expiresAt} compact />
          )}
        </div>
      </div>

      <CardContent className="pt-6">
        {/* Amount Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Payment Summary
          </h4>

          <div className="space-y-3">
            {/* Total Amount */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatKES(escrow.totalAmount)}
              </span>
            </div>

            {/* Platform Fee */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Platform Fee</span>
              <span className="text-gray-600 dark:text-gray-300">
                - {formatKES(escrow.platformFee)}
              </span>
            </div>

            {/* Tax */}
            {escrow.tax > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">VAT</span>
                <span className="text-gray-600 dark:text-gray-300">
                  - {formatKES(escrow.tax)}
                </span>
              </div>
            )}

            {/* Technician Payout */}
            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Technician Receives
              </span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatKES(escrow.technicianPayout)}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        {escrow.milestones && escrow.milestones.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Milestones
            </h4>
            <div className="space-y-2">
              {escrow.milestones.map((milestone, index) => (
                <div
                  key={milestone._id || index}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800/50',
                    milestone.status === 'released' && 'bg-green-50 dark:bg-green-900/20',
                    milestone.status === 'refunded' && 'bg-purple-50 dark:bg-purple-900/20'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MilestoneStatusBadge status={milestone.status} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {milestone.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatKES(milestone.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Customer
            </h5>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {customer?.firstName} {customer?.lastName}
            </p>
            {customer?.phoneNumber && (
              <p className="text-xs text-gray-500">{customer.phoneNumber}</p>
            )}
          </div>
          <div>
            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Technician
            </h5>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {technician?.firstName} {technician?.lastName}
            </p>
            {technician?.phoneNumber && (
              <p className="text-xs text-gray-500">{technician.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Latest Activity */}
        {latestHistory && (
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Latest Activity
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {latestHistory.notes || latestHistory.action}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(latestHistory.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Dispute Info */}
        {escrow.dispute && escrow.dispute.openedAt && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
              Dispute Opened
            </h5>
            <p className="text-sm text-red-600 dark:text-red-300">
              {escrow.dispute.reason}
            </p>
            {escrow.dispute.resolution && (
              <p className="text-xs text-red-500 mt-2">
                Resolution: {escrow.dispute.resolution.replace('_', ' ')}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {(canRelease || canRefund || canDispute || onViewBooking) && (
        <CardFooter className="justify-end gap-2 flex-wrap">
          {onViewBooking && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewBooking}
            >
              View Booking
            </Button>
          )}

          {canDispute && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDispute}
              disabled={isUpdating}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              Open Dispute
            </Button>
          )}

          {canRefund && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefund}
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Refund
            </Button>
          )}

          {canRelease && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRelease}
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Release Funds
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Milestone Status Badge
 */
const MilestoneStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    released: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        styles[status as keyof typeof styles] || styles.pending
      )}
    >
      {status}
    </span>
  );
};

// Status Icons
const PendingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FundedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const PartialIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ReleasedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefundedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const DisputedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CancelledIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default EscrowStatusCard;
