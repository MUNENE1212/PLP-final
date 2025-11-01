import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile, updateAvailability, clearError } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import SkillsManager from '@/components/profile/SkillsManager';
import {
  User,
  Settings,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  X,
  CheckCircle,
  Navigation,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { geocodeAddress, getCurrentCoordinates } from '@/services/geocoding.service';
import toast from 'react-hot-toast';

interface Skill {
  name: string;
  category: string;
  yearsOfExperience: number;
  certifications?: string[];
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: string;
  location: {
    address: string;
    city: string;
    county: string;
    country: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  skills?: Skill[];
}

const ProfileSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    location: {
      address: '',
      city: '',
      county: '',
      country: '',
      coordinates: [0, 0],
    },
    skills: [],
  });

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        location: {
          address: user.location?.address || '',
          city: user.location?.city || '',
          county: user.location?.county || '',
          country: user.location?.country || 'Kenya',
          coordinates: user.location?.coordinates || [0, 0],
        },
        skills: user.skills || [],
      });
      setIsAvailable(user.availability?.isAvailable || false);
      setImagePreview(
        user.profilePicture ||
          `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
      );
    }
  }, [user]);

  const handleSkillsChange = (skills: Skill[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
    setHasChanges(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setHasChanges(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!user) return;

    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    await dispatch(
      updateAvailability({
        userId: user._id,
        isAvailable: newAvailability,
      })
    );
  };

  // Geocode address when city or address changes
  const handleGeocodeLocation = async () => {
    const { address, city, country } = formData.location;

    if (!city && !address) {
      toast.error('Please enter at least a city or address');
      return;
    }

    setIsGeocodingLocation(true);
    try {
      const result = await geocodeAddress(address, city, country);

      if (result) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: result.coordinates,
            city: result.city || prev.location.city,
            county: result.county || prev.location.county,
          },
        }));
        toast.success('Location coordinates updated successfully!');
        setHasChanges(true);
      } else {
        toast.error('Could not find coordinates for this location. Please try a more specific address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode location. Please try again.');
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  // Get current location from browser
  const handleGetCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    try {
      const coordinates = await getCurrentCoordinates();

      if (coordinates) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates,
          },
        }));
        toast.success('Current location coordinates obtained!');
        setHasChanges(true);
      } else {
        toast.error('Could not get current location. Please enable location services.');
      }
    } catch (error) {
      console.error('Get current location error:', error);
      toast.error('Failed to get current location. Please check browser permissions.');
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate coordinates
    const { coordinates } = formData.location;
    if (coordinates[0] === 0 && coordinates[1] === 0) {
      toast.error(
        'Please set your location coordinates by clicking "Get Coordinates from Address" or "Use Current Location"'
      );
      return;
    }

    try {
      // Prepare update data
      const updates: any = {
        userId: user._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        location: {
          type: 'Point',
          coordinates: formData.location.coordinates,
          address: formData.location.address,
          city: formData.location.city,
          county: formData.location.county,
          country: formData.location.country,
        },
      };

      // Add skills for technicians
      if (user.role === 'technician' && formData.skills) {
        updates.skills = formData.skills;
      }

      // If there's a new profile picture, we would upload it here
      // For now, we'll skip the actual upload implementation
      if (selectedFile) {
        // TODO: Implement image upload to backend
        // updates.profilePicture = uploadedImageUrl;
      }

      const result = await dispatch(updateProfile(updates));

      if (updateProfile.fulfilled.match(result)) {
        setHasChanges(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm('You have unsaved changes. Are you sure you want to leave?')
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center text-3xl font-bold text-gray-900 dark:text-gray-100">
              <Settings className="mr-3 h-8 w-8 text-primary-600" />
              Profile Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your personal information and preferences
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="mb-6">
          <Alert
            variant="success"
            message="Profile updated successfully!"
            onClose={() => setShowSuccess(false)}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            message={error}
            onClose={() => dispatch(clearError())}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Camera className="mr-2 h-5 w-5 text-primary-600" />
            Profile Picture
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100"
              />
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Click the camera icon to upload a new picture
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <User className="mr-2 h-5 w-5 text-primary-600" />
            Basic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-900 py-2 pl-10 pr-4 text-gray-500 dark:text-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Brief description for your profile
              </p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            <MapPin className="mr-2 h-5 w-5 text-primary-600" />
            Location Information
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Location coordinates are used to match you with nearby customers/technicians.
            Enter your address and click "Get Coordinates from Address" or use your current location.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="location.address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label
                htmlFor="location.city"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="e.g., Nairobi"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location.county"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                County
              </label>
              <input
                type="text"
                id="location.county"
                name="location.county"
                value={formData.location.county}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="e.g., Nairobi County"
              />
            </div>

            <div>
              <label
                htmlFor="location.country"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Country
              </label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Kenya"
              />
            </div>

            {/* Coordinates Display */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coordinates <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Longitude:</span> {formData.location.coordinates[0].toFixed(6)}
                  {' | '}
                  <span className="font-medium">Latitude:</span> {formData.location.coordinates[1].toFixed(6)}
                </div>
                {formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0 && (
                  <span className="text-xs text-red-500">Not set</span>
                )}
                {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && (
                  <span className="text-xs text-green-600">Set ✓</span>
                )}
              </div>

              {/* Geocoding Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeocodeLocation}
                  disabled={isGeocodingLocation || isGettingCurrentLocation}
                >
                  {isGeocodingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Coordinates from Address
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  disabled={isGeocodingLocation || isGettingCurrentLocation}
                >
                  {isGettingCurrentLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Use Current Location
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Coordinates are required for location-based matching. Click one of the buttons above to set them.
              </p>
            </div>
          </div>
        </div>

        {/* Technician-specific sections */}
        {user.role === 'technician' && (
          <>
            {/* Availability Toggle */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                <CheckCircle className="mr-2 h-5 w-5 text-primary-600" />
                Availability Status
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Currently{' '}
                    {isAvailable ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">Unavailable</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Toggle your availability to let customers know if you're
                    accepting new jobs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAvailabilityToggle}
                  disabled={isLoading}
                  className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                    isAvailable ? 'bg-green-600' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                      isAvailable ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Skills Management */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <SkillsManager
                skills={formData.skills || []}
                onChange={handleSkillsChange}
              />
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <>
                <Loading size="sm" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
