/**
 * Pricing Types
 * Task #74: Real-Time Pricing & Negotiation
 */

// Surge pricing levels
export type SurgeLevel = 'none' | 'low' | 'moderate' | 'high' | 'severe';

// Peak hour types
export type PeakType = 'morning' | 'evening' | null;

// Multiplier breakdown
export interface PricingMultipliers {
  surge: number;
  peakHour: number;
  urgency: number;
  technician: number;
  timeBased: number;
  combinedSurge: number;
}

// Surge information
export interface SurgeInfo {
  active: boolean;
  level: SurgeLevel;
  demandLevel: number;
  percentageIncrease: number;
}

// Peak hour information
export interface PeakInfo {
  isPeak: boolean;
  peakType: PeakType;
}

// Dynamic price breakdown
export interface DynamicPriceBreakdown {
  basePrice: number;
  multipliers: PricingMultipliers;
  fees: {
    distance: number;
  };
  surgeInfo: SurgeInfo;
  peakInfo: PeakInfo;
  subtotal: number;
  totalAmount: number;
  bookingFee: {
    amount: number;
    percentage: number;
    tierLabel: string;
  };
  currency: string;
  calculatedAt: string;
}

// Dynamic price calculation response
export interface DynamicPriceResponse {
  success: boolean;
  breakdown?: DynamicPriceBreakdown;
  configVersion?: number;
  error?: string;
}

// Market rate for a category
export interface CategoryMarketRate {
  surgeActive: boolean;
  surgeMultiplier: number;
  surgeLevel: SurgeLevel;
  demandLevel: number;
  peakHour: boolean;
  lastUpdated: string;
}

// Market rates response
export interface MarketRatesResponse {
  success: boolean;
  rates: Record<string, CategoryMarketRate>;
  timestamp: string;
  error?: string;
}

// Surge alert for a category
export interface SurgeAlert {
  category: string;
  level: SurgeLevel;
  multiplier: number;
  percentageIncrease: number;
  demandLevel: number;
}

// Surge alerts response
export interface SurgeAlertsResponse {
  success: boolean;
  alerts: SurgeAlert[];
  timestamp: string;
  error?: string;
}

// Negotiation history item
export interface NegotiationHistoryItem {
  round: number;
  proposedBy: 'technician' | 'customer';
  proposedByUser?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  proposedAt: string;
  proposedAmount: number;
  reason?: string;
  additionalNotes?: string;
  validUntil?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'superseded' | 'withdrawn';
  response?: {
    respondedAt: string;
    accepted: boolean;
    notes?: string;
    counterAmount?: number;
  };
}

// Counter offer
export interface CounterOffer {
  proposedBy: string;
  proposedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  proposedPricing: {
    basePrice: number;
    serviceCharge?: number;
    platformFee?: number;
    tax?: number;
    discount?: number;
    totalAmount: number;
    currency: string;
  };
  reason?: string;
  additionalNotes?: string;
  validUntil?: string;
  round?: number;
  customerResponse?: {
    respondedAt: string;
    accepted: boolean;
    notes?: string;
    counterAmount?: number;
  };
}

// Negotiation history response
export interface NegotiationHistoryResponse {
  success: boolean;
  data: {
    currentCounterOffer: CounterOffer | null;
    negotiationHistory: NegotiationHistoryItem[];
    originalPricing: {
      totalAmount: number;
      currency: string;
    };
    maxRounds: number;
    roundsRemaining: number;
  };
  error?: string;
}

// Socket event types
export const PRICING_SOCKET_EVENTS = {
  // Subscribe/unsubscribe
  SUBSCRIBE: 'pricing:subscribe',
  UNSUBSCRIBE: 'pricing:unsubscribe',

  // Market rates
  GET_MARKET_RATES: 'pricing:get_market_rates',
  MARKET_RATES: 'pricing:market_rates',

  // Surge
  GET_SURGE: 'pricing:get_surge',
  SURGE_INFO: 'pricing:surge_info',
  SURGE_ALERT: 'pricing:surge_alert',

  // Price estimate
  GET_ESTIMATE: 'pricing:get_estimate',
  ESTIMATE: 'pricing:estimate',

  // Counter offer
  COUNTER_OFFER_SUBSCRIBE: 'counter_offer:subscribe',
  COUNTER_OFFER_UNSUBSCRIBE: 'counter_offer:unsubscribe',
  COUNTER_OFFER_NEW: 'counter_offer:new',
  COUNTER_OFFER_ACCEPTED: 'counter_offer:accepted',
  COUNTER_OFFER_REJECTED: 'counter_offer:rejected',
  COUNTER_OFFER_STATE: 'counter_offer:state',

  // Errors
  ERROR: 'pricing:error',
  COUNTER_OFFER_ERROR: 'counter_offer:error'
} as const;

// Service categories for pricing
export const SERVICE_CATEGORIES = [
  'plumbing',
  'electrical',
  'carpentry',
  'masonry',
  'painting',
  'hvac',
  'welding',
  'other'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
