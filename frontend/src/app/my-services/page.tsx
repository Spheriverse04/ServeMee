// frontend/src/app/my-services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  isActive: boolean;
  imageUrl?: string; // Include imageUrl
}

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null); // For success/error messages after actions
  const router = useRouter();

  const fetchMyServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch('http://localhost:3000/services/my-services/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. You may not have permission to view this page or your session expired. Please log in as a Service Provider.');
          // router.push('/auth/email-password'); // Uncomment if you want to force redirect on 401/403
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your services.');
      }

      const data = await response.json();
      setServices(data.services); // Assuming the backend returns an object with a 'services' array
    } catch (err: any) {
      console.error('Error fetching my services:', err);
      setError(err.message || 'An unexpected error occurred while fetching your services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, [router]);

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    setLoading(true); // Set loading to indicate action is in progress
    setActionMessage(null); // Clear previous messages
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setActionMessage('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }), // Toggle the status
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update service status.');
      }

      const updatedService = await response.json();
      setActionMessage('Service status updated successfully!');
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId ? { ...service, isActive: updatedService.service.isActive } : service
        )
      );
    } catch (err: any) {
      console.error('Error toggling service status:', err);
      setActionMessage(err.message || 'An unexpected error occurred while updating service status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setActionMessage('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service.');
      }

      setActionMessage('Service deleted successfully!');
      setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setActionMessage(err.message || 'An unexpected error occurred while deleting the service.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading your services...</p>
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
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <Link href="/services/new" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            + Create New Service
          </Link>
        </div>

        {actionMessage && (
          <div className={`p-3 rounded-md text-center text-sm mb-4 ${actionMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {actionMessage}
          </div>
        )}

        {!loading && services.length === 0 && !error && (
          <p className="text-center text-gray-600">
            You haven't listed any services yet. Click "Create New Service" to get started!
          </p>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                 {service.imageUrl && (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Service+Image';
                      }}
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h2>
                  <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-2">{service.description}</p>
                  <p className="text-gray-700 font-bold mb-1">
                    Price: ₹{service.price.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    Category: {service.category || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 mt-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${service.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                      disabled={loading}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link href={`/my-services/edit/${service.id}`} className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
