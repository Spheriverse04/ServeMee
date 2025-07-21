// frontend/src/app/service-categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  serviceTypes: ServiceType[];
}

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  baseFareType: string;
}

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/service-categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch service categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service categories...</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Categories</h1>
          <p className="text-gray-600">Choose a service category to request a service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {category.iconUrl && (
                    <img 
                      src={category.iconUrl} 
                      alt={category.name}
                      className="w-12 h-12 mr-4"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Available Services:</h3>
                  {category.serviceTypes.length > 0 ? (
                    <ul className="space-y-1">
                      {category.serviceTypes.slice(0, 3).map((serviceType) => (
                        <li key={serviceType.id} className="text-sm text-gray-600">
                          • {serviceType.name}
                        </li>
                      ))}
                      {category.serviceTypes.length > 3 && (
                        <li className="text-sm text-gray-500">
                          ... and {category.serviceTypes.length - 3} more
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No services available yet</p>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    href={`/service-categories/${category.id}`}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors inline-block text-center"
                  >
                    View Services
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No service categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}