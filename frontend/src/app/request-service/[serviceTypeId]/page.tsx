// frontend/src/app/request-service/[serviceTypeId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  baseFareType: string;
  category: {
    name: string;
  };
}

export default function RequestServicePage() {
  const params = useParams();
  const serviceTypeId = params.serviceTypeId as string;
  const router = useRouter();

  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [serviceAddress, setServiceAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [requestDetails, setRequestDetails] = useState('');

  useEffect(() => {
    if (serviceTypeId) {
      fetchServiceType();
      getCurrentLocation();
    }
  }, [serviceTypeId]);

  const fetchServiceType = async () => {
    try {
      const response = await fetch(`http://localhost:3000/service-types/${serviceTypeId}`);
      
      if (!response.ok) {
        throw new Error('Service type not found');
      }

      const data = await response.json();
      setServiceType(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Location is optional, so we don't show an error
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceAddress.trim()) {
      setError('Please provide a service address');
      return;
    }

    if (!latitude || !longitude) {
      setError('Location is required. Please enable location access or enter coordinates manually.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        router.push('/auth/email-password');
        return;
      }

      const requestData = {
        serviceTypeId,
        latitude,
        longitude,
        serviceAddress: serviceAddress.trim(),
        requestDetails: requestDetails.trim() ? JSON.parse(`{"description": "${requestDetails.trim()}"}`) : undefined,
      };

      const response = await fetch('http://localhost:3000/service-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service request');
      }

      const result = await response.json();
      
      // Redirect to service requests page with success message
      router.push('/service-requests?success=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service details...</p>
      </div>
    );
  }

  if (error && !serviceType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request {serviceType?.name}
            </h1>
            <p className="text-gray-600">
              Category: {serviceType?.category.name}
            </p>
            {serviceType?.description && (
              <p className="text-gray-600 mt-2">{serviceType.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="serviceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Service Address *
              </label>
              <textarea
                id="serviceAddress"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter the complete address where you need the service"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                  placeholder="Auto-detected"
                />
              </div>
            </div>

            <div>
              <label htmlFor="requestDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                id="requestDetails"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Provide any additional details about your service request..."
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Your request will be sent to nearby service providers</li>
              <li>2. You'll receive an OTP code to share with the provider</li>
              <li>3. A service provider will contact you and arrive at your location</li>
              <li>4. Share the OTP to confirm service initiation</li>
              <li>5. Pay after the service is completed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}