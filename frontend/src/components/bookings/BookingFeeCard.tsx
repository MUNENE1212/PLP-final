import React from 'react';
import { DollarSign, Shield, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { BookingFeeStatus } from '@/services/bookingFee.service';

interface BookingFeeCardProps {
  bookingFee: BookingFeeStatus;
  totalAmount: number;
  remainingAmount: number;
  currency?: string;
  onPayClick?: () => void;
  isPaymentPending?: boolean;
  showPayButton?: boolean;
}

const BookingFeeCard: React.FC<BookingFeeCardProps> = ({
  bookingFee,
  totalAmount,
  remainingAmount,
  currency = 'KES',
  onPayClick,
  isPaymentPending = false,
  showPayButton = false,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-warning',
          bg: 'bg-warning-bg',
          border: 'border-warning/30',
          label: 'Payment Required',
          description: 'Please pay the booking fee to proceed with technician matching',
        };
      case 'paid':
      case 'held':
        return {
          icon: Shield,
          color: 'text-circuit',
          bg: 'bg-info-bg',
          border: 'border-circuit/30',
          label: 'Held in Escrow',
          description: 'Your booking fee is safely held and will be released to the technician after job completion',
        };
      case 'released':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bg: 'bg-success-bg',
          border: 'border-success/30',
          label: 'Released to Technician',
          description: 'Booking fee has been released to the technician',
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          color: 'text-steel',
          bg: 'bg-hover',
          border: 'border-subtle',
          label: 'Refunded',
          description: 'Booking fee has been refunded to your account',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-steel',
          bg: 'bg-hover',
          border: 'border-subtle',
          label: 'Unknown Status',
          description: '',
        };
    }
  };

  const statusConfig = getStatusConfig(bookingFee.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card variant="glass" className={`border-2 ${statusConfig.border} ${statusConfig.bg}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-bone">Booking Fee</h3>
              <p className={`text-sm ${statusConfig.color} font-medium`}>
                {statusConfig.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-bone">
              {bookingFee.amount.toLocaleString()} {currency}
            </div>
            <div className="text-sm text-steel">{bookingFee.percentage}% of total</div>
            {bookingFee.tierLabel && (
              <div className="mt-1 inline-block px-2 py-0.5 bg-circuit/20 rounded text-xs font-medium text-circuit">
                {bookingFee.tierLabel} Tier
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-steel mb-4">
          {statusConfig.description}
        </p>

        {/* Breakdown */}
        <div className="glass rounded-lg p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-steel">Total Booking Amount:</span>
            <span className="font-semibold text-bone">
              {totalAmount.toLocaleString()} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-steel">Booking Fee ({bookingFee.percentage}%):</span>
            <span className="font-semibold text-circuit">
              {bookingFee.amount.toLocaleString()} {currency}
            </span>
          </div>
          <div className="border-t border-subtle pt-2 flex justify-between">
            <span className="text-steel">Remaining Balance:</span>
            <span className="font-bold text-lg text-bone">
              {remainingAmount.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-steel">100% Refundable</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-circuit flex-shrink-0" />
            <span className="text-steel">Escrow Protected</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-steel">Secure Payment</span>
          </div>
        </div>

        {/* Timestamps */}
        {(bookingFee.paidAt || bookingFee.releasedAt || bookingFee.refundedAt) && (
          <div className="border-t border-subtle pt-4 space-y-1">
            {bookingFee.paidAt && (
              <div className="text-xs text-steel">
                Paid: {new Date(bookingFee.paidAt).toLocaleString()}
              </div>
            )}
            {bookingFee.releasedAt && (
              <div className="text-xs text-steel">
                Released: {new Date(bookingFee.releasedAt).toLocaleString()}
              </div>
            )}
            {bookingFee.refundedAt && (
              <div className="text-xs text-steel">
                Refunded: {new Date(bookingFee.refundedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {showPayButton && bookingFee.status === 'pending' && onPayClick && (
          <div className="mt-4">
            <Button
              onClick={onPayClick}
              disabled={isPaymentPending}
              className="w-full glass-button"
            >
              {isPaymentPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay {bookingFee.amount.toLocaleString()} {currency} Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Notes */}
        {bookingFee.notes && (
          <div className="mt-4 p-3 glass rounded-lg">
            <p className="text-sm text-steel">
              <span className="font-medium text-bone">Note:</span> {bookingFee.notes}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookingFeeCard;
