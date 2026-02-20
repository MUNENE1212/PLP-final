/**
 * DynamicPriceCalculator Component
 * Displays real-time price breakdown with multipliers and surge indicator
 *
 * Task #74: Real-Time Pricing & Negotiation
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  User
} from 'lucide-react';
import { DynamicPriceBreakdown, SurgeInfo, PeakInfo } from '@/types/pricing';

interface DynamicPriceCalculatorProps {
  breakdown: DynamicPriceBreakdown;
  showDetails?: boolean;
  className?: string;
}

const DynamicPriceCalculator: React.FC<DynamicPriceCalculatorProps> = ({
  breakdown,
  showDetails = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);

  const formatCurrency = (amount: number, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (multiplier: number) => {
    const percent = ((multiplier - 1) * 100);
    if (percent === 0) return null;
    return percent > 0 ? `+${percent.toFixed(0)}%` : `${percent.toFixed(0)}%`;
  };

  const surgeInfo = breakdown.surgeInfo;
  const peakInfo = breakdown.peakInfo;
  const multipliers = breakdown.multipliers;

  // Calculate total multiplier effect
  const hasActiveMultipliers = useMemo(() => {
    return (
      surgeInfo.active ||
      peakInfo.isPeak ||
      multipliers.urgency > 1 ||
      multipliers.technician > 1 ||
      multipliers.timeBased > 1
    );
  }, [surgeInfo, peakInfo, multipliers]);

  // Surge indicator component
  const SurgeIndicator = () => {
    if (!surgeInfo.active) return null;

    const levelColors = {
      low: 'bg-yellow-500',
      moderate: 'bg-orange-500',
      high: 'bg-red-500',
      severe: 'bg-red-700',
      none: ''
    };

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <Zap className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-700 dark:text-red-300">
          Surge Pricing Active
        </span>
        <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${levelColors[surgeInfo.level]}`}>
          {surgeInfo.level.toUpperCase()}
        </span>
        <span className="text-sm text-red-600 dark:text-red-400">
          (+{surgeInfo.percentageIncrease}%)
        </span>
      </div>
    );
  };

  // Peak hour indicator
  const PeakIndicator = () => {
    if (!peakInfo.isPeak) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Peak Hour ({peakInfo.peakType})
        </span>
        <span className="text-sm text-amber-600 dark:text-amber-400">
          (+{((multipliers.peakHour - 1) * 100).toFixed(0)}%)
        </span>
      </div>
    );
  };

  // Multiplier row component
  const MultiplierRow = ({
    label,
    multiplier,
    icon: Icon,
    description
  }: {
    label: string;
    multiplier: number;
    icon: React.ElementType;
    description?: string;
  }) => {
    const percent = formatPercentage(multiplier);
    if (!percent || multiplier === 1) return null;

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          {description && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({description})</span>
          )}
        </div>
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          {percent}
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header with total price */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Price</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(breakdown.totalAmount, breakdown.currency)}
            </p>
          </div>
          {hasActiveMultipliers && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Active alerts */}
        {(surgeInfo.active || peakInfo.isPeak) && (
          <div className="flex flex-wrap gap-2 mt-3">
            <SurgeIndicator />
            <PeakIndicator />
          </div>
        )}
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Base price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Base Price</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(breakdown.basePrice, breakdown.currency)}
            </span>
          </div>

          {/* Applied multipliers */}
          {hasActiveMultipliers && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Applied Multipliers
              </p>
              <div className="space-y-0">
                <MultiplierRow
                  label="Surge Pricing"
                  multiplier={multipliers.surge}
                  icon={Zap}
                  description={`Demand: ${surgeInfo.demandLevel} bookings`}
                />
                <MultiplierRow
                  label="Peak Hour"
                  multiplier={multipliers.peakHour}
                  icon={Clock}
                  description={peakInfo.peakType || ''}
                />
                <MultiplierRow
                  label="Urgency"
                  multiplier={multipliers.urgency}
                  icon={AlertTriangle}
                />
                <MultiplierRow
                  label="Technician Tier"
                  multiplier={multipliers.technician}
                  icon={User}
                />
                <MultiplierRow
                  label="Time-based"
                  multiplier={multipliers.timeBased}
                  icon={Clock}
                />
              </div>
            </div>
          )}

          {/* Distance fee */}
          {breakdown.fees.distance > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Distance Fee</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(breakdown.fees.distance, breakdown.currency)}
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(breakdown.subtotal, breakdown.currency)}
            </span>
          </div>

          {/* Booking fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Booking Fee ({breakdown.bookingFee.percentage}% - {breakdown.bookingFee.tierLabel})
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(breakdown.bookingFee.amount, breakdown.currency)}
            </span>
          </div>

          {/* Calculated timestamp */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Price calculated at {new Date(breakdown.calculatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicPriceCalculator;
