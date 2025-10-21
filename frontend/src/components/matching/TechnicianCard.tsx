import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { Match } from '@/store/slices/matchingSlice';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import { formatRating } from '@/utils/rating';

interface TechnicianCardProps {
  match: Match;
  onViewProfile: (technicianId: string) => void;
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  match,
  onViewProfile,
  onAccept,
  onReject,
}) => {
  const navigate = useNavigate();
  const [showScores, setShowScores] = useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${match.technician._id}`);
  };

  const getMatchQualityBadge = (score: number) => {
    if (score >= 90) {
      return { label: 'Excellent Match', color: 'bg-green-100 text-green-800 border-green-300' };
    }
    if (score >= 75) {
      return { label: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (score >= 60) {
      return { label: 'Good Match', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
    if (score >= 40) {
      return { label: 'Fair Match', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { label: 'Poor Match', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  const getProfilePicture = () => {
    return (
      match.technician.profilePicture ||
      `https://ui-avatars.com/api/?name=${match.technician.firstName}+${match.technician.lastName}&background=random`
    );
  };

  const matchQuality = getMatchQualityBadge(match.scores.overall);

  const scoreItems = [
    { label: 'Skill Match', value: match.scores.skillMatch, icon: Award, color: 'text-purple-600' },
    { label: 'Location', value: match.scores.locationProximity, icon: MapPin, color: 'text-blue-600' },
    { label: 'Availability', value: match.scores.availability, icon: Clock, color: 'text-green-600' },
    { label: 'Rating', value: match.scores.rating, icon: Star, color: 'text-yellow-600' },
    { label: 'Experience', value: match.scores.experienceLevel, icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4">
            {/* Profile Picture */}
            <div className="relative cursor-pointer" onClick={handleProfileClick}>
              <img
                src={getProfilePicture()}
                alt={match.technician.firstName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-100 hover:ring-primary-500 transition-all"
                title={`View ${match.technician.firstName}'s profile`}
              />
              {match.technician.availability?.status === 'available' && (
                <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={handleProfileClick}
                  title={`View ${match.technician.firstName}'s profile`}
                >
                  {match.technician.firstName} {match.technician.lastName}
                </h3>
                {match.scores.overall >= 85 && (
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {formatRating(match.technician.rating)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{match.distance.toFixed(1)} km away</span>
                </div>
                {match.technician.yearsOfExperience && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>{match.technician.yearsOfExperience} yrs exp</span>
                  </div>
                )}
                {match.technician.hourlyRate && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>KES {match.technician.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mt-2 flex flex-wrap gap-2">
                {match.technician.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {skill.category.replace('_', ' ')} - {skill.proficiency}
                  </span>
                ))}
                {match.technician.skills.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                    +{match.technician.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Quality Badge */}
          <div className="flex flex-col items-end">
            <div
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold',
                matchQuality.color
              )}
            >
              {matchQuality.label}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {match.scores.overall}
              <span className="text-lg text-gray-500">/100</span>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {match.matchReasons.length > 0 && (
          <div className="mt-4 rounded-lg bg-primary-50 p-4">
            <h4 className="mb-2 flex items-center text-sm font-semibold text-primary-900">
              <Sparkles className="mr-2 h-4 w-4" />
              Why this match?
            </h4>
            <ul className="space-y-1">
              {match.matchReasons.map((reason, index) => (
                <li key={index} className="flex items-start text-sm text-primary-800">
                  <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
                  <span>{reason.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Score Breakdown Toggle */}
        <button
          onClick={() => setShowScores(!showScores)}
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {showScores ? 'Hide' : 'Show'} detailed scores
        </button>

        {/* Detailed Scores */}
        {showScores && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-3">
            {scoreItems.map((item, index) => {
              const Icon = item.icon;
              const percentage = item.value;
              return (
                <div key={index} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <Icon className={cn('h-4 w-4', item.color)} />
                    <span className="text-lg font-bold text-gray-900">{percentage}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">{item.label}</div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className={cn('h-1.5 rounded-full', {
                        'bg-green-500': percentage >= 80,
                        'bg-blue-500': percentage >= 60 && percentage < 80,
                        'bg-yellow-500': percentage >= 40 && percentage < 60,
                        'bg-gray-400': percentage < 40,
                      })}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(match._id)}
          className="flex items-center space-x-2"
        >
          <XCircle className="h-4 w-4" />
          <span>Not Interested</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(match.technician._id)}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>View Profile</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept(match._id)}
          className="flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Book Now</span>
        </Button>
      </div>
    </div>
  );
};

export default TechnicianCard;
