// frontend/src/app/my-bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

interface Booking {
  id: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  agreedPrice: string; // From backend, it's a string decimal
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    provider: {
      id: string;
      email: string;
      displayName?: string;
    };
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null); // For success/error messages after actions
  const router = useRouter();

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch('http://localhost:3000/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Please log in again.');
          router.push('/auth/email-password');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings.');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'An unexpected error occurred while fetching your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [router]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setActionMessage(null); // Clear previous messages
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setActionMessage('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch(`http://localhost:3000/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking.');
      }

      const data = await response.json();
      setActionMessage('Booking cancelled successfully!');
      // Update the status of the cancelled booking in the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: data.booking.status } : booking
        )
      );
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setActionMessage(err.message || 'An unexpected error occurred while cancelling the booking.');
    }
  };

  const getStatusBadgeColor = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/email-password')}
            className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          My Bookings
        </h1>

        {actionMessage && (
          <div className={`p-3 rounded-md mb-4 text-center ${actionMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {actionMessage}
          </div>
        )}

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600 text-xl mt-10">You have no bookings yet. Explore services to book one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {booking.service.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Service Provider:</span>{' '}
                    {booking.service.provider?.displayName || booking.service.provider?.email}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">When:</span>{' '}
                    {format(parseISO(booking.startTime), 'MMM dd, yyyy HH:mm')} -{' '}
                    {format(parseISO(booking.endTime), 'HH:mm')}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Agreed Price:</span> ₹{parseFloat(booking.agreedPrice).toFixed(2)}
                  </p>
                  {booking.notes && (
                    <p className="text-gray-600 text-sm mt-2 italic">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeColor(booking.status)} mb-2`}
                  >
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                  {/* Cancel button for PENDING or CONFIRMED bookings */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
