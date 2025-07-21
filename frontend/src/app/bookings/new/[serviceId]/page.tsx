// frontend/src/app/bookings/new/[serviceId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns'; // For date formatting

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  provider: {
    id: string;
    email: string;
    displayName: string;
  };
}

export default function NewBookingPage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [errorService, setErrorService] = useState<string | null>(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedPrice, setAgreedPrice] = useState<string | number>(service?.price.toString() || ''); // Initialize with service price as string

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (!serviceId) {
      setErrorService('Service ID is missing.');
      setLoadingService(false);
      return;
    }

    const fetchService = async () => {
      setLoadingService(true);
      setErrorService(null);
      try {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
          setErrorService('Authentication token not found. Please log in.');
          router.push('/auth/email-password');
          return;
        }

        const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setErrorService('Unauthorized. Please log in again.');
            router.push('/auth/email-password');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch service details.');
        }

        const data = await response.json();
        setService(data.service);
        setAgreedPrice(data.service.price.toString()); // Set initial agreed price from service price
        // Set a default start/end time for convenience (e.g., next day 9am-10am)
        const now = new Date();
        const tomorrow = new Date(now.setDate(now.getDate() + 1));
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(10, 0, 0, 0); // 10:00 AM

        setStartTime(format(tomorrow, "yyyy-MM-dd'T'HH:mm"));
        setEndTime(format(tomorrowEnd, "yyyy-MM-dd'T'HH:mm"));


      } catch (err: any) {
        console.error('Error fetching service:', err);
        setErrorService(err.message || 'An unexpected error occurred while fetching service details.');
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [serviceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    if (!serviceId) {
      setBookingError('Service ID is missing.');
      setSubmitting(false);
      return;
    }
    if (!startTime || !endTime || agreedPrice === '') {
      setBookingError('Please fill in all required fields (Start Time, End Time, Agreed Price).');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setBookingError('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      // Backend expects ISO 8601 string, which input type="datetime-local" provides
      const bookingData = {
        serviceId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        agreedPrice: parseFloat(agreedPrice as string), // Ensure it's a number
        notes,
      };

      const response = await fetch('http://localhost:3000/bookings', { // Your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking.');
      }

      const data = await response.json();
      setBookingSuccess('Booking created successfully! You will be redirected to your bookings.');
      console.log('Booking created:', data.booking);
      // Optionally redirect after a short delay
      setTimeout(() => {
        router.push('/my-bookings'); // Redirect to user's bookings page
      }, 2000);

    } catch (err: any) {
      console.error('Error creating booking:', err);
      setBookingError(err.message || 'An unexpected error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service details...</p>
      </div>
    );
  }

  if (errorService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{errorService}</p>
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Book Service: {service.name}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Provided by: {service.provider.displayName || service.provider.email}
        </p>
        <p className="text-center text-gray-700 text-lg mb-6">
          Price: ₹{parseFloat(service.price).toFixed(2)} {/* Corrected line */}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Start Time:
            </label>
            <input
              type="datetime-local"
              id="startTime"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              End Time:
            </label>
            <input
              type="datetime-local"
              id="endTime"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="agreedPrice" className="block text-sm font-medium text-gray-700">
              Agreed Price (₹):
            </label>
            <input
              type="number"
              id="agreedPrice"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
              required
              disabled={submitting}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional):
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            ></textarea>
          </div>

          {bookingError && <p className="text-red-600 text-sm text-center">{bookingError}</p>}
          {bookingSuccess && <p className="text-green-600 text-sm text-center">{bookingSuccess}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
