import { QRCodeDisplay } from './QRCodeDisplay';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui';

interface ReviewQRProps {
  technicianId: string;
  bookingId: string;
  technicianName: string;
}

export const ReviewQR = ({ technicianId, bookingId, technicianName }: ReviewQRProps) => {
  const reviewUrl = `${window.location.origin}/bookings/${bookingId}/review`;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-xl">
          <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
            Leave a Review
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your feedback helps us improve
          </p>
        </div>
      </div>

      <QRCodeDisplay
        data={reviewUrl}
        title={`Rate ${technicianName}`}
        description="How was your experience? Share your thoughts."
        showLogo={true}
        showActions={true}
      />
    </Card>
  );
};
