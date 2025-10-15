import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Award,
  Briefcase,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  bio?: string;
  rating: number;
  skills: Array<{
    category: string;
    proficiency: string;
    yearsOfExperience: number;
  }>;
  location?: {
    coordinates: [number, number];
    address: string;
  };
  availability?: {
    status: string;
  };
  hourlyRate?: number;
  yearsOfExperience?: number;
  completedJobs?: number;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  verification?: {
    isVerified: boolean;
    backgroundCheck: boolean;
    insurance: boolean;
  };
}

const TechnicianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/users/${id}`);
        setTechnician(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load technician profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTechnician();
    }
  }, [id]);

  const getProfilePicture = () => {
    if (!technician) return '';
    return (
      technician.profilePicture ||
      `https://ui-avatars.com/api/?name=${technician.firstName}+${technician.lastName}&background=random`
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" text="Loading technician profile..." />
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900">Error Loading Profile</h3>
          <p className="mt-2 text-red-700">{error || 'Technician not found'}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/find-technicians')}
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={getProfilePicture()}
              alt={technician.firstName}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-gray-100"
            />
            {technician.availability?.status === 'available' && (
              <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white bg-green-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {technician.firstName} {technician.lastName}
                </h1>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{technician.rating.toFixed(1)}</span>
                  </div>
                  {technician.completedJobs && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{technician.completedJobs} jobs completed</span>
                    </div>
                  )}
                  {technician.yearsOfExperience && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{technician.yearsOfExperience} years experience</span>
                    </div>
                  )}
                </div>
              </div>

              {technician.availability?.status === 'available' && (
                <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  Available Now
                </div>
              )}
            </div>

            {/* Verification Badges */}
            {technician.verification && (
              <div className="mt-4 flex flex-wrap gap-2">
                {technician.verification.isVerified && (
                  <div className="flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    <Shield className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                )}
                {technician.verification.backgroundCheck && (
                  <div className="flex items-center space-x-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Background Check</span>
                  </div>
                )}
                {technician.verification.insurance && (
                  <div className="flex items-center space-x-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                    <Shield className="h-4 w-4" />
                    <span>Insured</span>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {technician.bio && (
              <p className="mt-4 text-gray-700">{technician.bio}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-3 border-t border-gray-200 pt-6">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/find-technicians')}
          >
            Book This Technician
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex items-center space-x-2"
          >
            <Phone className="h-4 w-4" />
            <span>Contact</span>
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center text-lg font-bold text-gray-900">
            <Award className="mr-2 h-5 w-5 text-primary-600" />
            Skills & Expertise
          </h2>
          <div className="space-y-3">
            {technician.skills.map((skill, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {skill.category.replace('_', ' ')}
                  </span>
                  <span
                    className={cn('rounded-full px-3 py-1 text-xs font-semibold', {
                      'bg-green-100 text-green-800': skill.proficiency === 'expert',
                      'bg-blue-100 text-blue-800': skill.proficiency === 'advanced',
                      'bg-yellow-100 text-yellow-800': skill.proficiency === 'intermediate',
                      'bg-gray-100 text-gray-800': skill.proficiency === 'beginner',
                    })}
                  >
                    {skill.proficiency}
                  </span>
                </div>
                {skill.yearsOfExperience > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    {skill.yearsOfExperience} years experience
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Availability */}
        <div className="space-y-6">
          {/* Pricing */}
          {technician.hourlyRate && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-lg font-bold text-gray-900">
                <DollarSign className="mr-2 h-5 w-5 text-primary-600" />
                Pricing
              </h2>
              <div className="rounded-lg bg-primary-50 p-4">
                <div className="text-3xl font-bold text-primary-900">
                  KES {technician.hourlyRate}
                  <span className="text-lg text-primary-700">/hour</span>
                </div>
                <p className="mt-2 text-sm text-primary-700">
                  Final price may vary based on job complexity
                </p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-bold text-gray-900">
              <Phone className="mr-2 h-5 w-5 text-primary-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{technician.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{technician.email}</span>
              </div>
              {technician.location?.address && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{technician.location.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certifications */}
        {technician.certifications && technician.certifications.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 flex items-center text-lg font-bold text-gray-900">
              <Award className="mr-2 h-5 w-5 text-primary-600" />
              Certifications
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {technician.certifications.map((cert, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {cert.issuer} • {cert.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianProfile;
