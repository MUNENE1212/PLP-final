import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBooking, CreateBookingData } from '@/store/slices/bookingSlice';
import { acceptMatch, AcceptMatchParams } from '@/store/slices/matchingSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Calendar, MapPin, Clock, FileText, DollarSign, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatRating } from '@/utils/rating';
import BookingFeePaymentModal from '@/components/bookings/BookingFeePaymentModal';
import PriceEstimate from '@/components/bookings/PriceEstimate';
import ServiceTypeSelector from '@/components/bookings/ServiceTypeSelector';
import { getPriceEstimate, calculatePrice, PricingBreakdown } from '@/services/pricing.service';

const SERVICE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'welding', label: 'Welding' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'general_handyman', label: 'General Handyman' },
  { value: 'other', label: 'Other' },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Within a week', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium - Within 2-3 days', color: 'text-blue-600' },
  { value: 'high', label: 'High - Within 24 hours', color: 'text-orange-600' },
  { value: 'emergency', label: 'Emergency - ASAP', color: 'text-red-600' },
];

interface LocationState {
  matchId?: string;
  technician?: any;
  serviceCategory?: string;
  location?: { coordinates: [number, number]; address: string };
}

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isCreating } = useAppSelector((state) => state.bookings);
  const { user } = useAppSelector((state) => state.auth);

  const locationState = location.state as LocationState | null;

  const [formData, setFormData] = useState<CreateBookingData>({
    serviceType: '',
    serviceCategory: locationState?.serviceCategory || '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 120, // Default 2 hours in minutes
    serviceLocation: {
      coordinates: locationState?.location?.coordinates || [0, 0],
      address: locationState?.location?.address || '',
      landmarks: '',
      accessInstructions: '',
    },
    technician: locationState?.technician?._id || '',
    urgency: 'medium',
    images: [],
    quantity: 1, // Default quantity for per-unit services
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<PricingBreakdown | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (!formData.scheduledDate) {
      setFormData((prev) => ({ ...prev, scheduledDate: today }));
    }
  }, []);

  // Fetch price estimate when relevant fields change
  useEffect(() => {
    const fetchEstimate = async () => {
      // Only require service category and type for estimate
      if (formData.serviceCategory && formData.serviceType) {
        setIsLoadingEstimate(true);
        try {
          // Use default coordinates if not provided (Nairobi center)
          const coordinates =
            formData.serviceLocation.coordinates[0] !== 0
              ? formData.serviceLocation.coordinates
              : [-1.2921, 36.8219]; // Nairobi default

          const scheduledDateTime = formData.scheduledDate
            ? `${formData.scheduledDate}T${formData.scheduledTime || '09:00'}`
            : undefined;

          // If technician is selected (from matching), use calculatePrice for accurate estimate with distance
          if (locationState?.technician?._id) {
            console.log('=== CALCULATING PRICE WITH TECHNICIAN ===');
            console.log('Technician ID:', locationState.technician._id);
            console.log('Technician Location:', locationState.technician.location);
            console.log('Service Category:', formData.serviceCategory);
            console.log('Service Type:', formData.serviceType);
            console.log('Urgency:', formData.urgency);
            console.log('Quantity:', formData.quantity || 1);

            const response = await calculatePrice({
              serviceCategory: formData.serviceCategory,
              serviceType: formData.serviceType,
              urgency: formData.urgency,
              serviceLocation: {
                type: 'Point',
                coordinates: coordinates,
              },
              technicianLocation: locationState.technician.location,
              technicianId: locationState.technician._id,
              scheduledDateTime: scheduledDateTime,
              quantity: formData.quantity || 1,
            });

            console.log('=== PRICE CALCULATION RESPONSE ===');
            console.log('Full response:', response);
            console.log('Success:', response.success);
            console.log('response.pricing:', response.pricing);
            console.log('Total Amount:', response.pricing?.totalAmount);
            console.log('Booking Fee:', response.pricing?.bookingFee);
            console.log('Distance Fee:', response.pricing?.distanceFee);
            console.log('===================================');

            if (response.success && response.pricing) {
              console.log('✅ Setting priceEstimate to:', response.pricing);
              setPriceEstimate(response.pricing);
            }
          } else {
            // No technician selected yet, use general estimate
            const response = await getPriceEstimate({
              serviceCategory: formData.serviceCategory,
              serviceType: formData.serviceType,
              urgency: formData.urgency as any,
              serviceLocation: {
                type: 'Point',
                coordinates: coordinates,
              },
              scheduledDateTime: scheduledDateTime,
              quantity: formData.quantity || 1,
            });

            if (response.success) {
              setPriceEstimate(response.estimate);
            }
          }
        } catch (error) {
          console.error('Failed to fetch price estimate:', error);
          toast.error('Unable to calculate price estimate. Please try again.');
        } finally {
          setIsLoadingEstimate(false);
        }
      } else {
        // Clear estimate if required fields are missing
        setPriceEstimate(null);
      }
    };

    // Debounce the API call - increased to 800ms to reduce API spam
    const timer = setTimeout(() => {
      fetchEstimate();
    }, 800);

    return () => clearTimeout(timer);
  }, [
    formData.serviceCategory,
    formData.serviceType,
    formData.urgency,
    formData.serviceLocation.coordinates,
    formData.scheduledDate,
    formData.scheduledTime,
    formData.quantity,
    locationState?.technician, // Re-calculate when technician changes
  ]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }
    if (!formData.serviceCategory) {
      newErrors.serviceCategory = 'Service category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    }
    if (!formData.serviceLocation.address.trim()) {
      newErrors.address = 'Service address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('serviceLocation.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        serviceLocation: {
          ...prev.serviceLocation,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (locationState?.matchId) {
        // If coming from matching, accept the match and create booking
        const acceptParams: AcceptMatchParams = {
          matchId: locationState.matchId,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime!,
          description: formData.description,
          estimatedDuration: formData.estimatedDuration,
          serviceType: formData.serviceType,
          quantity: formData.quantity || 1,
        };

        const result = await dispatch(acceptMatch(acceptParams)).unwrap();
        const booking = result.data.booking;

        // Debug: Log the booking data to verify structure
        console.log('Created booking from match data:', booking);
        console.log('Booking fee from booking:', booking.bookingFee);
        console.log('Booking fee amount from booking:', booking.bookingFee?.amount);
        console.log('Price estimate available:', priceEstimate);
        console.log('Booking fee from price estimate:', priceEstimate?.bookingFee);

        // Show payment modal instead of navigating
        setCreatedBooking(booking);
        setShowPaymentModal(true);
        toast.success('Booking created! Please complete payment to proceed.');
      } else {
        // Direct booking creation
        const result = await dispatch(createBooking(formData)).unwrap();
        const booking = result.booking;

        // Debug: Log the booking data to verify structure
        console.log('Created booking data:', booking);
        console.log('Booking fee from booking:', booking.bookingFee);
        console.log('Booking fee amount from booking:', booking.bookingFee?.amount);
        console.log('Price estimate available:', priceEstimate);
        console.log('Booking fee from price estimate:', priceEstimate?.bookingFee);

        // Show payment modal instead of navigating
        setCreatedBooking(booking);
        setShowPaymentModal(true);
        toast.success('Booking created! Please complete payment to proceed.');
      }
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error || 'Failed to create booking');
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Payment successful! Your booking is now being matched with technicians.');
    setShowPaymentModal(false);
    navigate(`/bookings/${createdBooking._id}`);
  };

  const handlePaymentClose = () => {
    // Don't allow closing without payment
    const confirm = window.confirm(
      'Payment is required to proceed with booking. Close without paying? Your booking will remain pending.'
    );
    if (confirm) {
      setShowPaymentModal(false);
      navigate(`/bookings/${createdBooking._id}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {locationState?.matchId ? 'Complete Your Booking' : 'Create New Booking'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {locationState?.matchId
            ? `Booking with ${locationState.technician?.firstName} ${locationState.technician?.lastName}`
            : 'Fill in the details for your service request'}
        </p>
      </div>

      {/* Technician Info (if from matching) */}
      {locationState?.technician && (
        <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-center space-x-4">
            {locationState.technician.profilePicture ? (
              <img
                src={locationState.technician.profilePicture}
                alt={locationState.technician.firstName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200 text-2xl font-bold text-primary-700">
                {locationState.technician.firstName[0]}
                {locationState.technician.lastName[0]}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {locationState.technician.firstName} {locationState.technician.lastName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  ⭐ {formatRating(locationState.technician.rating)}
                </span>
                {locationState.technician.hourlyRate && (
                  <span className="flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    KES {locationState.technician.hourlyRate}/hour
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Details */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            <FileText className="mr-2 h-5 w-5 text-primary-600" />
            Service Details
          </h2>

          <div className="space-y-4">
            <Select
              label="Service Category"
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              disabled={!!locationState?.serviceCategory}
              error={errors.serviceCategory}
              required
            >
              <option value="">Select a category</option>
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>

            {/* Service Type Selector with validation */}
            {formData.serviceCategory && (
              <ServiceTypeSelector
                serviceCategory={formData.serviceCategory}
                value={formData.serviceType}
                onChange={(selectedType) => {
                  setFormData((prev) => ({ ...prev, serviceType: selectedType }));
                  // Clear error when service type is selected
                  if (errors.serviceType) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.serviceType;
                      return newErrors;
                    });
                  }
                }}
              />
            )}

            {/* Show error if category not selected */}
            {!formData.serviceCategory && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Please select a service category first to see available service types.
                </p>
              </div>
            )}

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue or service needed in detail..."
              error={errors.description}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity / Units
              </label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity || 1}
                onChange={handleChange}
                min={1}
                max={100}
                placeholder="Enter number of units"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                For per-unit services (e.g., number of sockets, fans, fixtures to install)
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">💡 Pricing Tip:</span> Urgency level is automatically calculated based on your scheduled date and time:
              </p>
              <ul className="mt-2 text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                <li>• Within 4 hours = Emergency (2.0× base price)</li>
                <li>• Within 24 hours = High urgency (1.5× base price)</li>
                <li>• Within 3 days = Medium urgency (1.2× base price)</li>
                <li>• 3+ days ahead = Low urgency (standard price)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="mr-2 h-5 w-5 text-primary-600" />
            Scheduling
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                error={errors.scheduledDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                error={errors.scheduledTime}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Duration (hours)
              </label>
              <Input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration ? (formData.estimatedDuration / 60).toString() : ''}
                onChange={(e) => {
                  const hours = parseFloat(e.target.value) || 0;
                  const minutes = Math.round(hours * 60);
                  setFormData(prev => ({ ...prev, estimatedDuration: minutes }));
                }}
                min="0.5"
                step="0.5"
                placeholder="e.g., 2 for 2 hours"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Default: 2 hours
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            <MapPin className="mr-2 h-5 w-5 text-primary-600" />
            Service Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="serviceLocation.address"
                value={formData.serviceLocation.address}
                onChange={handleChange}
                placeholder="Street address, city, county"
                error={errors.address}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nearby Landmarks</label>
              <Input
                type="text"
                name="serviceLocation.landmarks"
                value={formData.serviceLocation.landmarks}
                onChange={handleChange}
                placeholder="e.g., Near City Mall, opposite Barclays Bank"
              />
            </div>

            <Textarea
              label="Access Instructions"
              name="serviceLocation.accessInstructions"
              value={formData.serviceLocation.accessInstructions}
              onChange={handleChange}
              rows={2}
              placeholder="Any special instructions for finding or accessing the location..."
            />
          </div>
        </div>

        {/* Price Estimate */}
        {(() => {
          console.log('=== PRICE ESTIMATE RENDER CHECK ===');
          console.log('priceEstimate exists:', !!priceEstimate);
          console.log('priceEstimate data:', priceEstimate);
          console.log('isLoadingEstimate:', isLoadingEstimate);
          console.log('===================================');
          return null;
        })()}

        {priceEstimate && (
          <PriceEstimate pricing={priceEstimate} isEstimate={true} className="mt-6" />
        )}

        {!priceEstimate && !isLoadingEstimate && formData.serviceCategory && formData.serviceType && (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ No price estimate available. Please check your service selection.
            </p>
          </div>
        )}

        {isLoadingEstimate && (
          <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Calculating price estimate...</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isCreating}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isCreating}
            className="min-w-[200px]"
          >
            {isCreating ? 'Creating...' : locationState?.matchId ? 'Confirm Booking' : 'Create Booking'}
          </Button>
        </div>
      </form>

      {/* Payment Modal */}
      {createdBooking && (() => {
        // Debug: Calculate amount with all fallbacks
        const amount = createdBooking.bookingFee?.amount ||
                       priceEstimate?.bookingFee ||
                       priceEstimate?.details?.bookingFee?.amount ||
                       0;

        console.log('=== PAYMENT MODAL PROPS DEBUG ===');
        console.log('createdBooking.bookingFee?.amount:', createdBooking.bookingFee?.amount);
        console.log('priceEstimate?.bookingFee:', priceEstimate?.bookingFee);
        console.log('priceEstimate?.details?.bookingFee?.amount:', priceEstimate?.details?.bookingFee?.amount);
        console.log('Final amount being passed:', amount);
        console.log('Currency:', createdBooking.pricing?.currency || priceEstimate?.currency || 'KES');
        console.log('Booking ID:', createdBooking._id);
        console.log('=================================');

        return (
          <BookingFeePaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentClose}
            amount={amount}
            currency={createdBooking.pricing?.currency || priceEstimate?.currency || 'KES'}
            bookingId={createdBooking._id}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      })()}
    </div>
  );
};

export default CreateBooking;
