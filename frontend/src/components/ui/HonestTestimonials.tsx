import React, { useEffect, useState } from 'react';
import { Star, MessageCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import axios from '@/lib/axios';
import { Link } from 'react-router-dom';

/**
 * HonestTestimonials - Shows ONLY real reviews from verified customers
 * No fake testimonials, no stock photos, no inflated claims
 */
export const HonestTestimonials: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/public/reviews', {
          params: {
            limit: 6,
            minRating: 1,
            sort: '-createdAt'
          }
        });

        setReviews(response.data.data.reviews);
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        // Don't show error, just show "no reviews yet"
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // No reviews yet - honest state
  if (!loading && reviews.length === 0) {
    return (
      <section className={cn('py-12 px-4', className)}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            What Customers Say
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            We're new and don't have reviews yet
          </p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-8 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4">
              <MessageCircle className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              No Reviews Yet - Be the First!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
              We're a new platform and haven't completed our first bookings yet.
              We'd love for you to try Dumu Waks and share your honest experience.
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-lg text-left">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Why Trust Dumu Waks?
            </h4>
            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><strong>Verified technicians</strong> - ID checked, skills assessed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><strong>Transparent pricing</strong> - See exact cost before booking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><strong>Secure payments</strong> - M-Pesa escrow protects both sides</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><strong>Dispute resolution</strong> - We mediate if issues arise</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><strong>Real accountability</strong> - Technicians must maintain ratings</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Link
              to="/create-booking"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Be the First to Review
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              After your first booking, you'll receive an email to leave your honest review.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className={cn('py-12 px-4', className)}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            What Real Customers Say
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading reviews...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="h-5 w-24 mb-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 rounded animate-pulse" />
              <div className="h-4 mb-2 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Show real reviews
  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          What Real Customers Say
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {reviews.length} verified review{reviews.length !== 1 ? 's' : ''} from real bookings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                ))}
              </div>
              <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded">
                ✓ Verified Booking
              </div>
            </div>

            <p className="text-neutral-700 dark:text-neutral-300 mb-4 italic leading-relaxed">
              "{review.text}"
            </p>

            <div className="flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              <span className="font-medium text-neutral-900 dark:text-white">
                {review.customer.firstName}
              </span>
              <span>from {review.customer.location.city}</span>
              <span>• {review.booking.serviceCategory}</span>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDistanceToNow(new Date(review.createdAt))} ago
              </span>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="text-center mb-6">
          <Link
            to="/reviews"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            See all {reviews.length} real reviews →
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          All reviews are from verified customers who completed bookings.
          We don't remove negative reviews unless they violate our policies.
        </span>
      </div>
    </section>
  );
};
