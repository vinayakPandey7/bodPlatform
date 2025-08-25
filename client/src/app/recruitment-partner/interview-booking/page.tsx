import { Suspense } from 'react';
import InterviewBookingPage from '../../../components/recruitment-partner/InterviewBookingPage';

const InterviewBookingPageWrapper = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview booking...</p>
        </div>
      </div>
    }>
      <InterviewBookingPage />
    </Suspense>
  );
};

export default InterviewBookingPageWrapper;
