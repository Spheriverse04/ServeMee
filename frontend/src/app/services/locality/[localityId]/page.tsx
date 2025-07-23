'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  isActive: boolean;
  imageUrl?: string;
  serviceType: {
    name: string;
    category: {
      name: string;
    };
  };
  serviceProvider: {
    user: {
      email: string;
      displayName: string;
    };
  };
}

export default function ServicesByLocalityPage() {
  const { localityId } = useParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/services/by-locality/${localityId}`);
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services by locality:', err);
      } finally {
        setLoading(false);
      }
    };

    if (localityId) fetchServices();
  }, [localityId]);

  if (loading) {
    return <div className="p-8">Loading services in this area...</div>;
  }

  if (services.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">No services found in this locality</h2>
        <p className="text-gray-500 mt-2">Please try another location or check back later.</p>
        <Link href="/services" className="btn-primary mt-6 inline-block">
          View All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Services in Your Area
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Services offered by providers registered in this locality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {service.name.charAt(0)}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur">
                    {service.serviceType?.category?.name || 'Other'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{service.baseFare.toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">base fare</span>
                  </div>
                  <Link
                    href={`/bookings/new/${service.id}`}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Book Now
                  </Link>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Provided by: <strong>{service.serviceProvider?.user?.displayName || 'Provider'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

