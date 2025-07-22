// frontend/src/app/service-types/[serviceTypeId]/request/page.tsx
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mb-4"></div>
          <p className="text-lg text-gray-700">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error && !serviceType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn-primary w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <button
              onClick={() => router.back()}
              className="text-indigo-100 hover:text-white mb-4 inline-flex items-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Request {serviceType?.name}
            </h1>
            <p className="text-indigo-100">
              Category: {serviceType?.category.name}
            </p>
            {serviceType?.description && (
              <p className="text-indigo-100 mt-2 opacity-90">{serviceType.description}</p>
            )}
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="serviceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Address *
                </label>
                <textarea
                  id="serviceAddress"
                  rows={3}
                  className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                  className="form-input"
                  placeholder="Provide any additional details about your service request..."
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What happens next?
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
                  <span>Your request will be sent to nearby service providers</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
                  <span>You'll receive an OTP code to share with the provider</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
                  <span>A service provider will contact you and arrive at your location</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
                  <span>Share the OTP to confirm service initiation</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">5</span>
                  <span>Pay after the service is completed</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
