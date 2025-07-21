// frontend/src/app/service-requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface ServiceRequest {
  id: string;
  serviceAddress: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  totalCost?: number;
  otpCode?: string;
  requestedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  serviceType: {
    id: string;
    name: string;
    category: {
      name: string;
    };
  };
  serviceProvider?: {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
  };
  requestDetails?: Record<string, any>;
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        router.push('/auth/email-password');
        return;
      }

      const userRole = localStorage.getItem('userRole');
      let endpoint = 'http://localhost:3000/service-requests/my-requests';
      
      if (userRole === 'service_provider') {
        endpoint = 'http://localhost:3000/service-requests/my-services';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, otpCode: string) => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch(`http://localhost:3000/service-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otpCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept service request');
      }

      fetchServiceRequests(); // Refresh the list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleStartService = async (requestId: string) => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch(`http://localhost:3000/service-requests/${requestId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start service');
      }

      fetchServiceRequests(); // Refresh the list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCompleteService = async (requestId: string) => {
    const totalCost = prompt('Enter the total cost for this service:');
    if (!totalCost) return;

    try {
      const token = localStorage.getItem('firebaseIdToken');
      const response = await fetch(`http://localhost:3000/service-requests/${requestId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalCost: parseFloat(totalCost) }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete service');
      }

      fetchServiceRequests(); // Refresh the list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REJECTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {userRole === 'service_provider' ? 'Service Requests' : 'My Service Requests'}
          </h1>
          {userRole === 'consumer' && (
            <Link 
              href="/service-categories" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Request New Service
            </Link>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">
              {userRole === 'service_provider' 
                ? 'No service requests available at the moment.' 
                : 'You haven\'t made any service requests yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {request.serviceType.category.name} - {request.serviceType.name}
                    </h3>
                    <p className="text-gray-600">{request.serviceAddress}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested:</span> {format(parseISO(request.requestedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {request.acceptedAt && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Accepted:</span> {format(parseISO(request.acceptedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                    {request.completedAt && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Completed:</span> {format(parseISO(request.completedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                  <div>
                    {request.serviceProvider && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Service Provider:</span> {request.serviceProvider.displayName || request.serviceProvider.email}
                      </p>
                    )}
                    {request.totalCost && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Total Cost:</span> ₹{request.totalCost}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Provider Actions */}
                {userRole === 'service_provider' && (
                  <div className="flex gap-2 mt-4">
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          const otp = prompt('Enter the OTP provided by the customer:');
                          if (otp) handleAcceptRequest(request.id, otp);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Accept Request
                      </button>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStartService(request.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Start Service
                      </button>
                    )}
                    {request.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteService(request.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                      >
                        Complete Service
                      </button>
                    )}
                  </div>
                )}

                {/* Consumer OTP Display */}
                {userRole === 'consumer' && request.status === 'PENDING' && request.otpCode && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">OTP Code:</span> 
                      <span className="font-mono text-lg ml-2">{request.otpCode}</span>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Share this OTP with the service provider when they arrive.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
