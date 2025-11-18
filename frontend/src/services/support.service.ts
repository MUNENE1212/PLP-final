import axios from '@/lib/axios';

// ===== TYPES =====

export interface SupportDashboardStats {
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  totalResolved: number;
  avgResponseTime: number;
  satisfactionRating: number;
  totalRatings: number;
  agentStats: {
    ticketsHandled: number;
    ticketsClosed: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    satisfactionRating: number;
    ratingCount: number;
  };
  timeRange: string;
}

export interface SupportTicket {
  id: string;
  _id: string;
  ticketNumber: string;
  subject: string;
  customer: string | {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  customerDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  assignedTo?: string | {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  assignedToDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_customer' | 'waiting_internal' | 'resolved' | 'closed' | 'reopened';
  category: string;
  createdAt: string;
  lastUpdate: string;
  messageCount: number;
  isEscalated: boolean;
  assignedAt?: string;
  resolvedAt?: string;
}

export interface PaginatedTickets {
  tickets: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TicketDetails extends SupportTicket {
  description: string;
  relatedBooking?: {
    _id: string;
    serviceType: string;
    status: string;
    scheduledDate?: string;
  };
  messages: Array<{
    _id: string;
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
      role: string;
    };
    senderRole: 'customer' | 'support' | 'admin';
    message: string;
    attachments: Array<{
      url: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    }>;
    isInternal: boolean;
    timestamp: string;
  }>;
  attachments?: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
  }>;
  resolution?: {
    summary: string;
    resolvedBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    resolutionType: string;
    resolutionNotes?: string;
  };
  customerSatisfaction?: {
    rating: number;
    feedback?: string;
    ratedAt: string;
  };
}

export interface AgentPerformance {
  total: number;
  open: number;
  closed: number;
  resolved: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionRating: number;
  slaCompliance: string;
  currentWorkload: number;
  period: {
    start: string;
    end: string;
  };
}

// ===== API FUNCTIONS =====

/**
 * Get support dashboard statistics
 */
export const getDashboardStats = async (timeRange: 'today' | 'week' | 'month' | 'all' = 'today'): Promise<SupportDashboardStats> => {
  try {
    const response = await axios.get('/support/dashboard-stats', {
      params: { timeRange }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching support stats:', error);
    throw error;
  }
};

/**
 * Get support tickets with filtering
 */
export const getTickets = async (params: {
  page?: number;
  limit?: number;
  status?: 'all' | 'open' | 'in_progress' | 'resolved' | string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<PaginatedTickets> => {
  try {
    const response = await axios.get('/support/tickets', { params });

    // Handle the actual API response format
    const data = response.data;
    return {
      tickets: data.tickets || [],
      pagination: {
        page: data.page || 1,
        limit: params.limit || 20,
        total: data.total || 0,
        pages: data.pages || 0
      }
    };
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

/**
 * Get ticket details by ID
 */
export const getTicketDetails = async (ticketId: string): Promise<TicketDetails> => {
  try {
    const response = await axios.get(`/support/tickets/${ticketId}`);
    return response.data.ticket || response.data.data;
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

/**
 * Assign ticket to support agent
 */
export const assignTicket = async (ticketId: string, agentId: string): Promise<SupportTicket> => {
  try {
    const response = await axios.patch(`/support/tickets/${ticketId}/assign`, {
      agentId
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
  ticketId: string,
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_customer' | 'waiting_internal' | 'resolved' | 'closed' | 'reopened',
  notes?: string
): Promise<SupportTicket> => {
  try {
    const response = await axios.patch(`/support/tickets/${ticketId}/status`, {
      status,
      notes
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

/**
 * Add message to ticket
 */
export const addTicketMessage = async (
  ticketId: string,
  message: string,
  attachments: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }> = [],
  isInternal: boolean = false
): Promise<any> => {
  try {
    const response = await axios.post(`/support/tickets/${ticketId}/messages`, {
      message,
      attachments,
      isInternal
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error adding ticket message:', error);
    throw error;
  }
};

/**
 * Close ticket with resolution
 */
export const closeTicket = async (
  ticketId: string,
  summary: string,
  resolutionType: 'solved' | 'workaround' | 'duplicate' | 'cannot_reproduce' | 'wont_fix' | 'other'
): Promise<SupportTicket> => {
  try {
    const response = await axios.post(`/support/tickets/${ticketId}/close`, {
      summary,
      resolutionType
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error closing ticket:', error);
    throw error;
  }
};

/**
 * Get agent performance metrics
 */
export const getAgentPerformance = async (
  startDate?: string,
  endDate?: string
): Promise<AgentPerformance> => {
  try {
    const response = await axios.get('/support/performance', {
      params: { startDate, endDate }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching agent performance:', error);
    throw error;
  }
};

/**
 * Get complete support dashboard data
 */
export const getCompleteDashboard = async (
  timeRange: 'today' | 'week' | 'month' | 'all' = 'today',
  ticketFilter: 'all' | 'open' | 'in_progress' | 'resolved' = 'all'
) => {
  try {
    const [stats, tickets] = await Promise.all([
      getDashboardStats(timeRange),
      getTickets({ status: ticketFilter, limit: 20 })
    ]);

    return {
      stats,
      tickets: tickets.tickets,
      pagination: tickets.pagination
    };
  } catch (error: any) {
    console.error('Error fetching complete support dashboard:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getTickets,
  getTicketDetails,
  assignTicket,
  updateTicketStatus,
  addTicketMessage,
  closeTicket,
  getAgentPerformance,
  getCompleteDashboard
};
