import React from 'react';
import { DollarSign, TrendingUp, Shield, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PricingBreakdown } from '@/services/pricing.service';

interface PriceEstimateProps {
  pricing: PricingBreakdown;
  isEstimate?: boolean;
  className?: string;
}

const PriceEstimate: React.FC<PriceEstimateProps> = ({
  pricing,
  isEstimate = false,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">
              {isEstimate ? 'Price Estimate' : 'Price Breakdown'}
            </h3>
          </div>
          {isEstimate && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
              Estimated
            </span>
          )}
        </div>

        {/* Price Items */}
        <div className="space-y-3 mb-4">
          {/* Base Price */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
            <span className="font-medium">
              {pricing.basePrice.toLocaleString()} {pricing.currency}
            </span>
          </div>

          {/* Distance Fee */}
          {pricing.distanceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Distance Fee:
                {pricing.details.distance && (
                  <span className="text-xs ml-1">
                    ({pricing.details.distance.kilometers}km)
                  </span>
                )}
              </span>
              <span className="font-medium">
                {pricing.distanceFee.toLocaleString()} {pricing.currency}
              </span>
            </div>
          )}

          {/* Urgency Multiplier */}
          {pricing.urgencyMultiplier > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Urgency Charge:
                <span className="text-xs ml-1">
                  ({pricing.details.urgency?.level})
                </span>
              </span>
              <span className="font-medium text-orange-600">
                ×{pricing.urgencyMultiplier}
              </span>
            </div>
          )}

          {/* Time Multiplier */}
          {pricing.timeMultiplier > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Time Surcharge:</span>
              <span className="font-medium text-orange-600">
                ×{pricing.timeMultiplier}
              </span>
            </div>
          )}

          {/* Technician Tier */}
          {pricing.technicianMultiplier > 1 && pricing.details.technician && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Technician Tier:
                <span className="text-xs ml-1">
                  ({pricing.details.technician.tier})
                </span>
              </span>
              <span className="font-medium text-blue-600">
                ×{pricing.technicianMultiplier}
              </span>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-semibold">
                {pricing.subtotal.toLocaleString()} {pricing.currency}
              </span>
            </div>
          </div>

          {/* Discount */}
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">Discount:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                -{pricing.discount.toLocaleString()} {pricing.currency}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">You Pay:</span>
            <span className="text-2xl font-bold text-green-600">
              {pricing.totalAmount.toLocaleString()} {pricing.currency}
            </span>
          </div>
        </div>

        {/* Technician Payout Breakdown (Info) */}
        {pricing.technicianPayout > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                  Payment Breakdown
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Platform fee and tax are deducted from technician earnings
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your Payment:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {pricing.totalAmount.toLocaleString()} {pricing.currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Platform Fee:
                  {pricing.details.platformFee && (
                    <span className="text-xs ml-1">
                      ({pricing.details.platformFee.value}%)
                    </span>
                  )}
                </span>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  -{pricing.platformFee.toLocaleString()} {pricing.currency}
                </span>
              </div>

              {pricing.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {pricing.details.tax?.name || 'VAT'}:
                    {pricing.details.tax && (
                      <span className="text-xs ml-1">
                        ({pricing.details.tax.rate}%)
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    -{pricing.tax.toLocaleString()} {pricing.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Technician Receives:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {pricing.technicianPayout.toLocaleString()} {pricing.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Fee Breakdown */}
        {pricing.bookingFee > 0 && pricing.details.bookingFee && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-5 border-2 border-blue-300 dark:border-blue-700 shadow-sm">
            <div className="flex items-start gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-base">
                  💳 Payment Structure
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {pricing.details.bookingFee.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              {/* Total Amount */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total Service Cost:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {pricing.totalAmount.toLocaleString()} {pricing.currency}
                </span>
              </div>

              {/* Booking Fee (Pay Now) */}
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 rounded p-3 border-l-4 border-blue-500">
                <div className="flex flex-col">
                  <span className="text-blue-900 dark:text-blue-100 font-semibold">
                    Pay Now ({pricing.details.bookingFee.percentage}% Booking Fee):
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Held in escrow until job completion
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {pricing.bookingFee.toLocaleString()} {pricing.currency}
                </span>
              </div>

              {/* Remaining Balance (Pay After) */}
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/30 rounded p-3 border-l-4 border-green-500">
                <div className="flex flex-col">
                  <span className="text-green-900 dark:text-green-100 font-semibold">
                    Pay After Service ({100 - pricing.details.bookingFee.percentage}%):
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    To be paid upon job completion
                  </span>
                </div>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {pricing.remainingAmount.toLocaleString()} {pricing.currency}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded p-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">
                ✅ 100% refundable if booking is cancelled before technician arrives
              </span>
            </div>
          </div>
        )}

        {/* Discount Info */}
        {pricing.details.discount && pricing.details.discount.applied && (
          <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                Discounts Applied
              </span>
            </div>
            <ul className="text-xs text-green-700 ml-6 space-y-1">
              {pricing.details.discount.reasons.map((reason: string, index: number) => (
                <li key={index}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Estimate Note */}
        {isEstimate && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <Info className="w-3 h-3 inline mr-1" />
              {pricing.distanceFee > 0 && pricing.details.distance ? (
                // Specific technician selected - accurate price
                <>
                  This price is calculated with the selected technician.
                  Final price may vary slightly based on actual service requirements.
                </>
              ) : (
                // No technician yet - estimate only
                <>
                  This is an estimate. Final price will be calculated when a technician is assigned
                  and may include distance fees based on their location.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PriceEstimate;
