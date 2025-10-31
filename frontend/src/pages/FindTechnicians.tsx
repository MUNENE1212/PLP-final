import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  findTechnicians,
  rejectMatch,
  clearMatches,
  clearError,
  FindTechniciansParams,
} from '@/store/slices/matchingSlice';
import SearchFilters from '@/components/matching/SearchFilters';
import TechnicianCard from '@/components/matching/TechnicianCard';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { Users, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FindTechnicians: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { matches, isSearching, error } = useAppSelector((state) => state.matching);

  const [hasSearched, setHasSearched] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    // Clear any previous searches when component mounts
    dispatch(clearMatches());
  }, [dispatch]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = async (params: FindTechniciansParams) => {
    setHasSearched(true);
    const result = await dispatch(findTechnicians(params));

    if (findTechnicians.fulfilled.match(result)) {
      const count = result.payload.data.length;
      if (count === 0) {
        toast.error('No technicians found matching your criteria. Try adjusting your filters.');
      } else {
        toast.success(`Found ${count} matching technician${count > 1 ? 's' : ''}!`);
      }
    }
  };

  const handleViewProfile = (technicianId: string) => {
    navigate(`/technicians/${technicianId}`);
  };

  const handleAccept = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowAcceptModal(true);
  };

  const handleReject = async (matchId: string) => {
    if (window.confirm('Are you sure you want to reject this match?')) {
      const result = await dispatch(rejectMatch({ matchId }));
      if (rejectMatch.fulfilled.match(result)) {
        toast.success('Match rejected');
      }
    }
  };

  const proceedToBooking = () => {
    if (selectedMatchId) {
      const match = matches.find((m) => m._id === selectedMatchId);
      if (match) {
        // Navigate to booking page with match data
        navigate(`/booking/create`, {
          state: {
            matchId: selectedMatchId,
            technician: match.technician,
            serviceCategory: match.serviceCategory,
            location: match.location,
          },
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="flex items-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          <Sparkles className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          Find the Perfect Technician
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Our AI-powered matching system finds the best technicians based on skills, location, ratings,
          and availability.
        </p>
      </div>

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

      {/* Layout */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Left Column - Search Filters */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <SearchFilters onSearch={handleSearch} isSearching={isSearching} />
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-8">
          {isSearching ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for the best technicians...</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Analyzing skills, ratings, location, and availability
                </p>
              </div>
            </div>
          ) : !hasSearched ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <Users className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Start Your Search
                </h3>
                <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                  Fill in the search criteria on the left to find technicians matched to your needs.
                  Our AI will rank them based on multiple factors.
                </p>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12">
              <div className="text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No Matches Found</h3>
                <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                  We couldn't find any technicians matching your criteria. Try:
                </p>
                <ul className="mt-4 space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Increasing your maximum distance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Adjusting your budget range</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Lowering urgency requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Being more flexible with dates</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-primary-900">
                      {matches.length} Technician{matches.length > 1 ? 's' : ''} Found
                    </h2>
                    <p className="text-sm text-primary-700">
                      Sorted by match quality - best matches first
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-primary-600" />
                </div>
              </div>

              {/* Match Cards */}
              {matches.map((match) => (
                <TechnicianCard
                  key={match._id}
                  match={match}
                  onViewProfile={handleViewProfile}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}

              {/* Tips */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-blue-900">Tips for choosing:</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span>
                      Matches with 90+ scores are excellent fits for your requirements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">⭐</span>
                    <span>
                      Check the detailed scores to see exactly why each technician was matched
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📍</span>
                    <span>Closer technicians may arrive faster and have lower travel costs</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accept Match Modal */}
      {showAcceptModal && selectedMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Proceed to Booking?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You'll be taken to the booking page where you can schedule the service and provide
              additional details.
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={proceedToBooking}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTechnicians;
