import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBooking, updateBookingStatus } from '@/store/slices/bookingSlice';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { formatRating } from '@/utils/rating';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  matching: {
    label: 'Finding Technician',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Clock,
  },
  assigned: {
    label: 'Assigned',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: User,
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  en_route: {
    label: 'On The Way',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: MapPin,
  },
  arrived: {
    label: 'Arrived',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: MapPin,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle,
  },
  disputed: {
    label: 'Disputed',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: AlertCircle,
  },
};

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentBooking: booking, isLoading, isUpdating } = useAppSelector(
    (state) => state.bookings
  );
  const { user } = useAppSelector((state) => state.auth);

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBooking(id));
    }
  }, [id, dispatch]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;

    try {
      await dispatch(
        updateBookingStatus({
          bookingId: booking._id,
          status: newStatus,
        })
      ).unwrap();
      toast.success(`Booking ${newStatus} successfully`);
      setShowCancelDialog(false);
    } catch (error: any) {
      toast.error(error || 'Failed to update booking status');
    }
  };

  const handleSendMessage = () => {
    navigate('/messages');
  };

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" text="Loading booking details..." />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const isCustomer = user?.role === 'customer';
  const isTechnician = user?.role === 'technician';

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/bookings')}
          className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Booking #{booking.bookingNumber}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{booking.serviceType}</p>
          </div>

          {/* Status Badge */}
          <div className={cn('flex items-center space-x-2 rounded-full px-4 py-2', statusConfig.bgColor)}>
            <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
            <span className={cn('font-semibold', statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service Details */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <FileText className="mr-2 h-5 w-5 text-primary-600" />
              Service Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Category</label>
                <p className="mt-1 font-medium capitalize text-gray-900 dark:text-gray-100">
                  {booking.serviceCategory.replace('_', ' ')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{booking.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgency</label>
                <p className="mt-1 font-medium capitalize text-gray-900 dark:text-gray-100">{booking.urgency}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Calendar className="mr-2 h-5 w-5 text-primary-600" />
              Schedule
            </h2>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(booking.timeSlot.date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {booking.timeSlot.startTime}
                    {booking.timeSlot.endTime && ` - ${booking.timeSlot.endTime}`}
                  </p>
                </div>
              </div>

              {booking.timeSlot.estimatedDuration && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Duration</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {booking.timeSlot.estimatedDuration} minutes
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <MapPin className="mr-2 h-5 w-5 text-primary-600" />
              Service Location
            </h2>

            <div className="space-y-2">
              <p className="text-gray-900 dark:text-gray-100">{booking.serviceLocation.address}</p>
              {booking.serviceLocation.landmarks && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Landmarks:</strong> {booking.serviceLocation.landmarks}
                </p>
              )}
              {booking.serviceLocation.accessInstructions && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Access Instructions:</strong> {booking.serviceLocation.accessInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          {booking.pricing && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <DollarSign className="mr-2 h-5 w-5 text-primary-600" />
                Pricing
              </h2>

              <div className="space-y-3">
                {booking.pricing.basePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      KES {booking.pricing.basePrice.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.pricing.platformFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      KES {booking.pricing.platformFee.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      KES {booking.pricing.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - People & Actions */}
        <div className="space-y-6">
          {/* Technician Info */}
          {booking.technician && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isCustomer ? 'Your Technician' : 'Technician'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {booking.technician.profilePicture ? (
                    <img
                      src={booking.technician.profilePicture}
                      alt={booking.technician.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                      {booking.technician.firstName[0]}
                      {booking.technician.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {booking.technician.firstName} {booking.technician.lastName}
                    </p>
                    {booking.technician.rating && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ⭐ {formatRating(booking.technician.rating)}
                      </p>
                    )}
                  </div>
                </div>

                {isCustomer && booking.status !== 'pending' && (
                  <div className="space-y-2">
                    <a
                      href={`tel:${booking.technician.phoneNumber}`}
                      className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{booking.technician.phoneNumber}</span>
                    </a>

                    <button
                      onClick={handleSendMessage}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Send Message</span>
                    </button>
                  </div>
                )}

                {isCustomer && booking.status === 'pending' && (
                  <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Complete payment to view technician contact details and begin communication.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Info (for technician) */}
          {isTechnician && booking.customer && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Customer</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {booking.customer.profilePicture ? (
                    <img
                      src={booking.customer.profilePicture}
                      alt={booking.customer.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-700 dark:text-gray-300">
                      {booking.customer.firstName[0]}
                      {booking.customer.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                  </div>
                </div>

                {booking.status !== 'pending' && (
                  <div className="space-y-2">
                    <a
                      href={`tel:${booking.customer.phoneNumber}`}
                      className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{booking.customer.phoneNumber}</span>
                    </a>

                    <button
                      onClick={handleSendMessage}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Send Message</span>
                    </button>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Customer contact details will be available once booking payment is confirmed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Actions</h2>

            <div className="space-y-2">
              {/* Customer Actions */}
              {isCustomer && booking.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  Cancel Booking
                </Button>
              )}

              {/* Technician Actions */}
              {isTechnician && booking.status === 'assigned' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleStatusUpdate('accepted')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Accept Booking
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Reject Booking
                  </Button>
                </>
              )}

              {isTechnician && booking.status === 'accepted' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate('en_route')}
                  disabled={isUpdating}
                  className="w-full"
                >
                  Mark as On The Way
                </Button>
              )}

              {isTechnician && booking.status === 'en_route' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate('arrived')}
                  disabled={isUpdating}
                  className="w-full"
                >
                  Mark as Arrived
                </Button>
              )}

              {isTechnician && (booking.status === 'arrived' || booking.status === 'in_progress') && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate(booking.status === 'arrived' ? 'in_progress' : 'completed')}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {booking.status === 'arrived' ? 'Start Work' : 'Complete Booking'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cancel Booking?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
                disabled={isUpdating}
              >
                Keep Booking
              </Button>
              <Button
                variant="primary"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
