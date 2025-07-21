// frontend/src/app/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  providerId: string;
  provider: {
    id: string;
    email: string;
    displayName: string;
  };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          router.push('/auth/email-password');
          return;
        }

        const response = await fetch('http://localhost:3000/services', { // Your backend URL
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
          throw new Error(errorData.message || 'Failed to fetch services.');
        }

        const data = await response.json();
        setServices(data.services);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.message || 'An unexpected error occurred while fetching services.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading services...</p>
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
          Available Services
        </h1>
        {services.length === 0 ? (
          <p className="text-center text-gray-600 text-xl mt-10">No services available at the moment. Please check back later!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {service.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {service.category && <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-2">
                      {service.category}
                    </span>}
                    {service.provider && <span className="text-gray-500">Provided by: {service.provider.displayName || service.provider.email}</span>}
                  </p>
                  <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-indigo-700">
                    ₹{parseFloat(service.price).toFixed(2)}
                  </span>
                  <Link href={`/bookings/new/${service.id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
