import React, { useState } from 'react';
import { X, DollarSign, FileText } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { Booking, submitCounterOffer } from '@/store/slices/bookingSlice';
import { useAppDispatch } from '@/store/hooks';
import toast from 'react-hot-toast';

interface CounterOfferModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

const CounterOfferModal: React.FC<CounterOfferModalProps> = ({ booking, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [proposedAmount, setProposedAmount] = useState(booking.pricing.totalAmount.toString());
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(proposedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the counter offer');
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        submitCounterOffer({
          bookingId: booking._id,
          proposedAmount: amount,
          reason: reason.trim(),
          additionalNotes: additionalNotes.trim(),
        })
      ).unwrap();
      toast.success('Counter offer submitted successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error || 'Failed to submit counter offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceDifference = parseFloat(proposedAmount) - booking.pricing.totalAmount;
  const percentageChange = ((priceDifference / booking.pricing.totalAmount) * 100).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Submit Counter Offer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Original Price */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Original Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {booking.pricing.currency} {booking.pricing.totalAmount.toLocaleString()}
            </p>
          </div>

          {/* Proposed Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Proposed Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="number"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="pl-10"
                placeholder="Enter proposed amount"
                required
                min="0"
                step="1"
              />
            </div>
            {priceDifference !== 0 && (
              <p
                className={`mt-1 text-sm ${
                  priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {priceDifference > 0 ? '+' : ''}
                {booking.pricing.currency} {Math.abs(priceDifference).toLocaleString()} (
                {priceDifference > 0 ? '+' : ''}
                {percentageChange}%)
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Counter Offer *
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Additional materials needed, More time required, etc."
              rows={3}
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information for the customer..."
              rows={2}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ️ The customer has 24 hours to accept or reject your counter offer.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Counter Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounterOfferModal;
