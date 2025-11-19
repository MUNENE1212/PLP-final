import axios from '@/lib/axios';

// ===== STATUS MANAGEMENT SERVICES =====

/**
 * Technician updates status to "en_route"
 */
export const updateToEnRoute = async (bookingId: string, notes?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/status/en-route`, { notes });
  return response.data;
};

/**
 * Technician updates status to "arrived"
 */
export const updateToArrived = async (bookingId: string, notes?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/status/arrived`, { notes });
  return response.data;
};

/**
 * Technician updates status to "in_progress"
 */
export const updateToInProgress = async (bookingId: string, notes?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/status/in-progress`, { notes });
  return response.data;
};

/**
 * Technician requests job completion (requires customer/support confirmation)
 */
export const requestCompletion = async (
  bookingId: string,
  data: { notes?: string; completionImages?: Array<{ url: string; caption?: string }> }
) => {
  const response = await axios.post(`/bookings/${bookingId}/status/request-complete`, data);
  return response.data;
};

/**
 * Customer/Support confirms or rejects completion
 */
export const confirmCompletion = async (
  bookingId: string,
  data: { approved: boolean; feedback?: string; issues?: string }
) => {
  const response = await axios.post(`/bookings/${bookingId}/status/confirm-complete`, data);
  return response.data;
};

/**
 * Pause job temporarily
 */
export const pauseJob = async (bookingId: string, reason?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/status/pause`, { reason });
  return response.data;
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId: string, reason?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

// ===== COMPLETION WORKFLOW SERVICES (Support) =====

/**
 * Support initiates follow-up for unresponsive customer
 */
export const initiateFollowUp = async (bookingId: string) => {
  const response = await axios.post(`/bookings/${bookingId}/followup/initiate`);
  return response.data;
};

/**
 * Support logs contact attempt
 */
export const logContactAttempt = async (
  bookingId: string,
  data: { method: 'call' | 'sms' | 'email' | 'in_app'; reached?: boolean; notes?: string }
) => {
  const response = await axios.post(`/bookings/${bookingId}/followup/log-contact`, data);
  return response.data;
};

/**
 * Support completes job after follow-up
 */
export const completeBySupport = async (
  bookingId: string,
  data: {
    outcome: 'customer_confirmed' | 'customer_disputed' | 'unreachable' | 'auto_completed';
    notes?: string;
  }
) => {
  const response = await axios.post(`/bookings/${bookingId}/followup/complete`, data);
  return response.data;
};

/**
 * Get bookings pending completion response (Support)
 */
export const getPendingCompletions = async (params: { page?: number; limit?: number } = {}) => {
  const response = await axios.get('/bookings/pending-completion', { params });
  return response.data;
};

// ===== TECHNICIAN ACTIONS =====

/**
 * Accept booking
 */
export const acceptBooking = async (bookingId: string) => {
  const response = await axios.post(`/bookings/${bookingId}/accept`);
  return response.data;
};

/**
 * Reject booking
 */
export const rejectBooking = async (bookingId: string, reason?: string) => {
  const response = await axios.post(`/bookings/${bookingId}/reject`, { reason });
  return response.data;
};

/**
 * Submit counter offer
 */
export const submitCounterOffer = async (
  bookingId: string,
  data: { proposedAmount: number; reason: string; additionalNotes?: string }
) => {
  const response = await axios.post(`/bookings/${bookingId}/counter-offer`, data);
  return response.data;
};

/**
 * Respond to counter offer
 */
export const respondToCounterOffer = async (
  bookingId: string,
  data: { accepted: boolean; notes?: string }
) => {
  const response = await axios.post(`/bookings/${bookingId}/counter-offer/respond`, data);
  return response.data;
};

// ===== MISC SERVICES =====

/**
 * Create dispute
 */
export const createDispute = async (
  bookingId: string,
  data: { reason: string; description: string; evidence?: any[] }
) => {
  const response = await axios.post(`/bookings/${bookingId}/dispute`, data);
  return response.data;
};

/**
 * Add QA checkpoint
 */
export const addQACheckpoint = async (
  bookingId: string,
  data: { description: string; images?: any[]; checklistItems?: any[] }
) => {
  const response = await axios.post(`/bookings/${bookingId}/qa-checkpoint`, data);
  return response.data;
};
