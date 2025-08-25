'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Phone, Video, User, Building, Briefcase, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingDetails: {
    location?: string;
    videoLink?: string;
    phoneNumber?: string;
    instructions?: string;
  };
  availableSpots: number;
}

interface BookingData {
  booking: {
    candidate: {
      name: string;
      email: string;
      phone: string;
    };
    job: {
      _id: string;
      title: string;
      location: string;
    };
    employer: {
      _id: string;
      companyName: string;
    };
    status: string;
  };
  availableSlots: TimeSlot[];
  expiresAt: string;
}

interface BookedData {
  booking: {
    scheduledDateTime: string;
    duration: number;
    timezone: string;
    interviewDetails: {
      type: string;
      location?: string;
      videoLink?: string;
      phoneNumber?: string;
      instructions?: string;
    };
    job: {
      title: string;
    };
    status: string;
  };
}

const InterviewBookingPage: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookedData, setBookedData] = useState<BookedData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [expired, setExpired] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBookingData();
    } else {
      setError('No booking token provided');
      setLoading(false);
    }
  }, [token]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interview-booking/slots?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.expired) {
          setExpired(true);
        } else if (data.alreadyBooked) {
          setAlreadyBooked(true);
          setBookedData(data);
        } else {
          setError(data.message || 'Failed to fetch booking data');
        }
        return;
      }

      setBookingData(data.data);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !token) return;

    try {
      setIsBooking(true);
      const response = await fetch('/api/interview-booking/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          slotId: selectedSlot._id,
          candidateNotes: candidateNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to book interview slot');
        return;
      }

      // Successfully booked
      setBookedData({ booking: data.data.booking });
      setAlreadyBooked(true);
      setBookingData(null);
    } catch (err) {
      setError('Failed to book interview slot');
      console.error('Error booking slot:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview booking...</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This interview booking link has expired. Please contact the employer or recruitment partner for a new link.
          </p>
          <div className="text-sm text-gray-500">
            If you believe this is an error, please reach out to support.
          </div>
        </div>
      </div>
    );
  }

  if (alreadyBooked && bookedData) {
    const { booking } = bookedData;
    const interviewDate = new Date(booking.scheduledDateTime);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Confirmed!</h1>
            <p className="text-gray-600">Your interview has been successfully scheduled.</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-medium">{booking.job.title}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                <span>{formatDate(booking.scheduledDateTime)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-3" />
                <span>
                  {interviewDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })} ({booking.timezone})
                </span>
              </div>
              
              <div className="flex items-center">
                {getMeetingIcon(booking.interviewDetails.type)}
                <span className="ml-3 capitalize">{booking.interviewDetails.type} Interview</span>
              </div>

              {booking.interviewDetails.videoLink && (
                <div className="flex items-start">
                  <Video className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-600">Video Link:</span>
                    <a 
                      href={booking.interviewDetails.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {booking.interviewDetails.videoLink}
                    </a>
                  </div>
                </div>
              )}

              {booking.interviewDetails.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-3" />
                  <span>{booking.interviewDetails.phoneNumber}</span>
                </div>
              )}

              {booking.interviewDetails.location && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                  <span>{booking.interviewDetails.location}</span>
                </div>
              )}
            </div>
          </div>

          {booking.interviewDetails.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
              <p className="text-gray-700 text-sm">{booking.interviewDetails.instructions}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• You will receive a confirmation email with all details</li>
              <li>• Please join the interview 5 minutes early</li>
              <li>• Have your resume and any relevant documents ready</li>
              <li>• Prepare questions about the role and company</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No booking data available</p>
        </div>
      </div>
    );
  }

  const { booking: bookingInfo, availableSlots, expiresAt } = bookingData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Interview</h1>
            <p className="text-gray-600">Select your preferred interview time slot</p>
          </div>

          {/* Job and Candidate Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Position Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Job Title:</span> {bookingInfo.job.title}</p>
                <p><span className="font-medium">Company:</span> {bookingInfo.employer.companyName}</p>
                <p><span className="font-medium">Location:</span> {bookingInfo.job.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Candidate Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {bookingInfo.candidate.name}</p>
                <p><span className="font-medium">Email:</span> {bookingInfo.candidate.email}</p>
                {bookingInfo.candidate.phone && (
                  <p><span className="font-medium">Phone:</span> {bookingInfo.candidate.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Expiry Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm">
                This booking link expires on {new Date(expiresAt).toLocaleDateString()} at{' '}
                {new Date(expiresAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Available Time Slots</h2>
          
          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No available time slots at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">Please contact the employer for alternative arrangements.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {availableSlots.map((slot) => (
                <div
                  key={slot._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSlot?._id === slot._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSlotSelection(slot)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{formatDate(slot.date)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getMeetingIcon(slot.meetingType)}
                        <span className="capitalize text-sm">{slot.meetingType}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {slot.duration} minutes
                      </span>
                      {slot.availableSpots > 1 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {slot.availableSpots} spots available
                        </span>
                      )}
                    </div>
                  </div>

                  {slot.meetingDetails?.instructions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{slot.meetingDetails.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Slot and Notes */}
        {selectedSlot && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Selection</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Selected Time Slot</h4>
              <div className="flex items-center space-x-6 text-sm">
                <span>{formatDate(selectedSlot.date)}</span>
                <span>{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span>
                <span className="capitalize">{selectedSlot.meetingType} Interview</span>
                <span>{selectedSlot.duration} minutes</span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="candidateNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="candidateNotes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or notes for the interviewer..."
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleBookSlot}
                disabled={isBooking}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isBooking ? 'Booking...' : 'Confirm Interview'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewBookingPage;
