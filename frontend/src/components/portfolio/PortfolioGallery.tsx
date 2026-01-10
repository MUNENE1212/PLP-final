import React, { useState } from 'react';
import { Image as ImageIcon, Heart, Bookmark, Eye, MapPin, Calendar, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  serviceCategory: string;
  images: Array<{
    url: string;
    type: string;
    caption: string;
  }>;
  location: {
    city: string;
  };
  completedAt: string;
  duration?: {
    amount: number;
    unit: string;
  };
  costRange?: {
    min: number;
    max: number;
  };
  views: number;
  likes: string[];
  customer?: {
    firstName: string;
    lastName: string;
  };
  customerTestimonial?: {
    text: string;
    rating: number;
  };
  booking?: {
    serviceCategory: string;
  };
}

interface PortfolioGalleryProps {
  portfolio: PortfolioItem[];
  onLike?: (portfolioId: string) => void;
  onSave?: (portfolioId: string) => void;
  loading?: boolean;
}

/**
 * PortfolioGallery - Grid display of verified technician work
 * Shows before/after images, testimonials, and project details
 */
export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolio,
  onLike,
  onSave,
  loading = false
}) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (item: PortfolioItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const nextImage = () => {
    if (selectedItem && currentImageIndex < selectedItem.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden">
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          No Portfolio Items Yet
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          This technician hasn't added their verified work yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => openLightbox(item)}
          >
            {/* Image Gallery */}
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[0].url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{item.images.length - 1} more
                    </div>
                  )}
                  {item.images[0].type === 'before' && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Before
                    </div>
                  )}
                  {item.images[0].type === 'after' && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      After
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-700">
                  <ImageIcon className="w-12 h-12 text-neutral-400" />
                </div>
              )}

              {/* Verified Badge */}
              <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                ✓ Verified Work
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Service Category */}
              <div className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full mb-3">
                {item.serviceCategory}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{item.location.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{item.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{item.likes.length}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike?.(item._id);
                  }}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Images Section */}
                <div className="relative bg-black">
                  {selectedItem.images.length > 0 && (
                    <img
                      src={selectedItem.images[currentImageIndex].url}
                      alt={selectedItem.title}
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Navigation Arrows */}
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        disabled={currentImageIndex === selectedItem.images.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {selectedItem.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {selectedItem.images.length}
                    </div>
                  )}

                  {/* Image Type Badge */}
                  {selectedItem.images[currentImageIndex]?.type && (
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full capitalize">
                      {selectedItem.images[currentImageIndex].type}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 lg:p-8 overflow-y-auto max-h-[90vh]">
                  {/* Close Button */}
                  <button
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Title & Category */}
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full mb-3">
                      {selectedItem.serviceCategory}
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                      {selectedItem.title}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedItem.location.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      <span>Completed {new Date(selectedItem.completedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedItem.duration && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-4 h-4" />
                        <span>{selectedItem.duration.amount} {selectedItem.duration.unit}</span>
                      </div>
                    )}
                    {selectedItem.costRange && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          KES {selectedItem.costRange.min.toLocaleString()}
                          {selectedItem.costRange.max && ` - KES ${selectedItem.costRange.max.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer Testimonial */}
                  {selectedItem.customerTestimonial && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(selectedItem.customerTestimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                        "{selectedItem.customerTestimonial.text}"
                      </p>
                      {selectedItem.customer && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                          - {selectedItem.customer.firstName} {selectedItem.customer.lastName}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Eye className="w-4 h-4" />
                      <span>{selectedItem.views} views</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Heart className="w-4 h-4" />
                      <span>{selectedItem.likes.length} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PortfolioGallery;
