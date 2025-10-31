import axiosInstance from '@/lib/axios';

export interface ServiceLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface PricingEstimateRequest {
  serviceCategory: string;
  serviceType: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  serviceLocation: ServiceLocation;
  scheduledDateTime?: string;
  quantity?: number;
}

export interface PricingBreakdown {
  basePrice: number;
  distanceFee: number;
  urgencyMultiplier: number;
  timeMultiplier: number;
  technicianMultiplier: number;
  subtotal: number;
  platformFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  technicianPayout: number;
  bookingFee: number;
  remainingAmount: number;
  currency: string;
  details: {
    servicePrice?: any;
    distance?: any;
    urgency?: any;
    timing?: any;
    technician?: any;
    platformFee?: {
      type: string;
      value: number;
      amount: number;
      note: string;
    };
    tax?: {
      name: string;
      rate: number;
      amount: number;
      note: string;
    };
    discount?: any;
    bookingFee?: {
      percentage: number;
      amount: number;
      remainingAmount: number;
      description: string;
      refundable: boolean;
      heldInEscrow: boolean;
    };
  };
}

export interface PricingEstimateResponse {
  success: boolean;
  estimate: PricingBreakdown;
  note?: string;
  configVersion?: number;
}

export interface ServiceCatalogItem {
  serviceCategory: string;
  serviceType: string;
  basePrice: number;
  priceUnit: string;
  estimatedDuration: number;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface ServiceCatalogResponse {
  success: boolean;
  services: ServiceCatalogItem[];
  category: string;
  currency: string;
}

/**
 * Get price estimate for a service
 */
export const getPriceEstimate = async (
  data: PricingEstimateRequest
): Promise<PricingEstimateResponse> => {
  const response = await axiosInstance.post('/pricing/estimate', data);
  return response.data;
};

/**
 * Get service catalog for a category
 */
export const getServiceCatalog = async (
  category: string
): Promise<ServiceCatalogResponse> => {
  const response = await axiosInstance.get(`/pricing/catalog/${category}`);
  return response.data;
};

/**
 * Calculate exact price (with specific technician)
 */
export const calculatePrice = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/pricing/calculate', data);
  return response.data;
};

/**
 * Compare prices from multiple technicians
 */
export const comparePrices = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/pricing/compare', data);
  return response.data;
};
