import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Match } from '@/store/slices/matchingSlice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { formatRating } from '@/utils/rating';
import { SwipeableCard } from '@/components/gestures';
import { hapticSuccess } from '@/lib/haptics';

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

  const handleSwipeLeft = () => {
    onViewProfile(match.technician._id);
    hapticSuccess();
  };

  const handleSwipeRight = () => {
    onAccept(match._id);
    hapticSuccess();
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
    { label: 'Skills', value: match.scores.skillMatch, icon: Award, color: 'text-purple-600' },
    { label: 'Location', value: match.scores.locationProximity, icon: MapPin, color: 'text-blue-600' },
    { label: 'Availability', value: match.scores.availability, icon: Clock, color: 'text-green-600' },
    { label: 'Rating', value: match.scores.rating, icon: Star, color: 'text-yellow-600' },
    { label: 'Experience', value: match.scores.experienceLevel, icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <SwipeableCard
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      leftAction={{
        icon: <Eye className="h-5 w-5" />,
        label: 'View Profile',
        color: 'bg-blue-500'
      }}
      rightAction={{
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Book Now',
        color: 'bg-green-500'
      }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
        {/* Cover with gradient background */}
        <div className="relative h-32 bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          {/* Profile picture */}
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={getProfilePicture()}
              alt={match.technician.firstName}
              className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg cursor-pointer object-cover"
              onClick={handleProfileClick}
            />
            {match.technician.availability?.status === 'available' && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Match Score Badge */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl text-right">
            <div className="text-white/90 text-xs font-medium mb-1">Match Score</div>
            <div className="text-white text-3xl font-bold">
              {match.scores.overall}
              <span className="text-base">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg font-bold text-neutral-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors truncate"
                  onClick={handleProfileClick}
                >
                  {match.technician.firstName} {match.technician.lastName}
                </h3>
                {match.scores.overall >= 85 && (
                  <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{formatRating(match.technician.rating)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{match.distance.toFixed(1)} km away</span>
                </div>
                {match.technician.yearsOfExperience && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{match.technician.yearsOfExperience} yrs exp.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Quality Badge */}
            <div
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap',
                matchQuality.color
              )}
            >
              {matchQuality.label}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {match.technician.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
              >
                {skill.category.replace('_', ' ')}
              </span>
            ))}
            {match.technician.skills.length > 3 && (
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-medium">
                +{match.technician.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        {match.matchReasons.length > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <h4 className="mb-2 flex items-center text-sm font-semibold text-primary-900 dark:text-primary-100">
              <Sparkles className="mr-2 h-4 w-4" />
              Why this match?
            </h4>
            <ul className="space-y-1">
              {match.matchReasons.slice(0, 2).map((reason, index) => (
                <li key={index} className="flex items-start text-sm text-primary-800 dark:text-primary-200">
                  <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>{reason.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Score Breakdown Toggle */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowScores(!showScores)}
          className="w-full flex items-center justify-center gap-2 mb-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {showScores ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide detailed scores
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show detailed scores
            </>
          )}
        </motion.button>

        {/* Detailed Scores */}
        <AnimatePresence>
          {showScores && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pb-3">
                {scoreItems.map((item, index) => {
                  const Icon = item.icon;
                  const percentage = item.value;
                  return (
                    <div key={index} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={cn('h-4 w-4', item.color)} />
                        <span className="text-lg font-bold text-neutral-900 dark:text-white">{percentage}</span>
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{item.label}</div>
                      <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={cn('h-1.5 rounded-full', {
                            'bg-green-500': percentage >= 80,
                            'bg-blue-500': percentage >= 60 && percentage < 80,
                            'bg-yellow-500': percentage >= 40 && percentage < 60,
                            'bg-neutral-400': percentage < 40,
                          })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(match._id)}
          className="flex-1"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(match.technician._id)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>

        <Button
          size="sm"
          onClick={() => onAccept(match._id)}
          className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Book Now
        </Button>
      </div>
    </Card>
    </SwipeableCard>
  );
};

export default TechnicianCard;
