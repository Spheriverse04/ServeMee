'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Interfaces ---
interface ServiceCategoryFromBackend {
  id: string;
  name: string;
}

interface ServiceTypeFromBackend {
  id: string;
  name: string;
  description?: string;
  baseFareType: string;
  category: ServiceCategoryFromBackend;
}

interface Service {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  isActive: boolean;
  imageUrl?: string;
  serviceType: ServiceTypeFromBackend;
}

interface Locality {
  id: string;
  name: string;
}

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const fetchedServices = Array.isArray(data)
        ? data
        : Array.isArray(data.services)
        ? data.services
        : [];

      const processedServices = fetchedServices.map(service => ({
        ...service,
        baseFare: typeof service.baseFare === 'string' ? parseFloat(service.baseFare) : service.baseFare,
      }));

      setServices(processedServices);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedLocalities = async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) return;

      const res = await fetch('http://localhost:3000/service-providers/localities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLocalities(data);
      } else {
        console.error('Failed to fetch localities');
      }
    } catch (err) {
      console.error('Error loading localities:', err);
    }
  };

  useEffect(() => {
    fetchMyServices();
    fetchAssignedLocalities();
  }, []);

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    setLoading(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setActionMessage('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const response = await fetch(`http://localhost:3000/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      setActionMessage(`Service ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      fetchMyServices();
    } catch (err: any) {
      setActionMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }

      setActionMessage('Service deleted successfully.');
      fetchMyServices();
    } catch (err: any) {
      setActionMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">My Services</h1>

        {actionMessage && (
          <div className="mb-4 p-3 rounded text-sm bg-blue-100 text-blue-800 text-center">
            {actionMessage}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <Link href="/services/new" className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 text-sm">
            + Create New Service
          </Link>
          <Link href="/my-services/locations" className="text-sm text-purple-700 hover:underline">
            Manage Service Areas →
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading services...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">You haven't added any services yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded shadow p-4 flex flex-col">
                {service.imageUrl && (
                  <img src={service.imageUrl} alt={service.name} className="w-full h-40 object-cover rounded mb-3" />
                )}
                <h2 className="text-lg font-bold text-gray-800">{service.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                <p className="text-sm text-gray-700">Type: {service.serviceType.name}</p>
                <p className="text-sm text-gray-700">Category: {service.serviceType.category.name}</p>
                <p className="text-sm text-gray-700 mb-2">Price: ₹{service.baseFare?.toFixed(2)}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link href={`/my-services/edit/${service.id}`} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assigned Localities */}
        <div className="mt-8 bg-white p-6 rounded shadow border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Assigned Areas</h3>
          {localities.length === 0 ? (
            <p className="text-sm text-gray-500">No areas assigned. Visit <Link href="/my-services/locations" className="text-blue-600 underline">Manage Service Areas</Link> to assign areas.</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {localities.map(loc => (
                <li key={loc.id}>{loc.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

