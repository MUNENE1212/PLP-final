import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBooking, CreateBookingData } from '@/store/slices/bookingSlice';
import { acceptMatch, AcceptMatchParams } from '@/store/slices/matchingSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Calendar, MapPin, Clock, FileText, DollarSign, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatRating } from '@/utils/rating';

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
    estimatedDuration: 60,
    serviceLocation: {
      coordinates: locationState?.location?.coordinates || [0, 0],
      address: locationState?.location?.address || '',
      landmarks: '',
      accessInstructions: '',
    },
    technician: locationState?.technician?._id || '',
    urgency: 'medium',
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (!formData.scheduledDate) {
      setFormData((prev) => ({ ...prev, scheduledDate: today }));
    }
  }, []);

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
        };

        const result = await dispatch(acceptMatch(acceptParams)).unwrap();
        toast.success('Booking created successfully!');
        navigate(`/bookings/${result.data.booking._id}`);
      } else {
        // Direct booking creation
        const result = await dispatch(createBooking(formData)).unwrap();
        toast.success('Booking created successfully!');
        navigate(`/bookings/${result.booking._id}`);
      }
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error || 'Failed to create booking');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {locationState?.matchId ? 'Complete Your Booking' : 'Create New Booking'}
        </h1>
        <p className="mt-2 text-gray-600">
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
              <h3 className="text-lg font-semibold text-gray-900">
                {locationState.technician.firstName} {locationState.technician.lastName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <FileText className="mr-2 h-5 w-5 text-primary-600" />
            Service Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={!!locationState?.serviceCategory}
              >
                <option value="">Select a category</option>
                {SERVICE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.serviceCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceCategory}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Type <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                placeholder="e.g., Fix leaking faucet, Install ceiling fan"
                error={errors.serviceType}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue or service needed in detail..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {URGENCY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Calendar className="mr-2 h-5 w-5 text-primary-600" />
            Scheduling
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
                Estimated Duration (minutes)
              </label>
              <Input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration?.toString() || ''}
                onChange={handleChange}
                min="15"
                step="15"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <MapPin className="mr-2 h-5 w-5 text-primary-600" />
            Service Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">Nearby Landmarks</label>
              <Input
                type="text"
                name="serviceLocation.landmarks"
                value={formData.serviceLocation.landmarks}
                onChange={handleChange}
                placeholder="e.g., Near City Mall, opposite Barclays Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Access Instructions</label>
              <textarea
                name="serviceLocation.accessInstructions"
                value={formData.serviceLocation.accessInstructions}
                onChange={handleChange}
                rows={2}
                placeholder="Any special instructions for finding or accessing the location..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default CreateBooking;
