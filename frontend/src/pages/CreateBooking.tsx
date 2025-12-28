import React from 'react';
import { useLocation } from 'react-router-dom';
import { BookingWizard } from '@/components/bookings/BookingWizard';

interface LocationState {
  matchId?: string;
  technician?: any;
  serviceCategory?: string;
  location?: { coordinates: [number, number]; address: string };
  prefilledData?: {
    service: string;
    problem: string;
    date: string;
    time: string;
    location: string;
  };
}

const CreateBooking: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  return (
    <BookingWizard
      matchId={locationState?.matchId}
      technician={locationState?.technician}
      serviceCategory={locationState?.serviceCategory}
      location={locationState?.location}
      prefilledData={locationState?.prefilledData}
    />
  );
};

export default CreateBooking;
