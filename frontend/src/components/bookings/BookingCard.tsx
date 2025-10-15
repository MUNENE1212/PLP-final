import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Booking } from '@/store/slices/bookingSlice';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

interface BookingCardProps {
  booking: Booking;
  userRole: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, userRole }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <Clock className="h-4 w-4" />,
      },
      matching: {
        label: 'Finding Technician',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <Loader className="h-4 w-4 animate-spin" />,
      },
      assigned: {
        label: 'Assigned',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: <User className="h-4 w-4" />,
      },
      accepted: {
        label: 'Accepted',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle className="h-4 w-4" />,
      },
      en_route: {
        label: 'En Route',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: <MapPin className="h-4 w-4" />,
      },
      arrived: {
        label: 'Arrived',
        color: 'bg-teal-100 text-teal-800 border-teal-300',
        icon: <MapPin className="h-4 w-4" />,
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <Loader className="h-4 w-4" />,
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: <XCircle className="h-4 w-4" />,
      },
      disputed: {
        label: 'Disputed',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <AlertCircle className="h-4 w-4" />,
      },
      paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div
        className={cn(
          'inline-flex items-center space-x-1 rounded-full border px-3 py-1 text-sm font-semibold',
          config.color
        )}
      >
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const getOtherParty = () => {
    if (userRole === 'customer') {
      return booking.technician;
    } else {
      return booking.customer;
    }
  };

  const otherParty = getOtherParty();

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/bookings/${booking._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.serviceType}
            </h3>
            {getStatusBadge(booking.status)}
          </div>
          <p className="mt-1 text-sm text-gray-600">#{booking.bookingNumber}</p>
        </div>

        {booking.pricing && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {booking.pricing.currency} {booking.pricing.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Total Amount</p>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm text-gray-700">
        {booking.description}
      </p>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Date & Time */}
        <div className="flex items-start space-x-2">
          <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(booking.timeSlot.date)}
            </p>
            <p className="text-xs text-gray-500">
              {formatTime(booking.timeSlot.startTime)}
              {booking.timeSlot.endTime && ` - ${formatTime(booking.timeSlot.endTime)}`}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2">
          <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {booking.serviceLocation.city || 'Service Location'}
            </p>
            <p className="line-clamp-1 text-xs text-gray-500">
              {booking.serviceLocation.address}
            </p>
          </div>
        </div>

        {/* Other Party (Customer or Technician) */}
        {otherParty && (
          <div className="flex items-start space-x-2">
            <User className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {otherParty.firstName} {otherParty.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === 'customer' ? 'Technician' : 'Customer'}
              </p>
            </div>
          </div>
        )}

        {/* Urgency */}
        <div className="flex items-start space-x-2">
          <AlertCircle className="mt-0.5 h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {booking.urgency} Priority
            </p>
            <p className="text-xs text-gray-500">Urgency Level</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end space-x-3 border-t border-gray-100 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bookings/${booking._id}`);
          }}
        >
          View Details
        </Button>

        {/* Status-specific actions */}
        {userRole === 'technician' && booking.status === 'assigned' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle reject
              }}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle accept
              }}
            >
              Accept
            </Button>
          </>
        )}

        {userRole === 'customer' && booking.status === 'completed' && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle payment
            }}
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Pay Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
