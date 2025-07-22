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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Categories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect service for your needs from our comprehensive categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {categories.map((category) => (
            <div key={category.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  {category.iconUrl && (
                    <img
                      src={category.iconUrl} 
                      alt={category.name}
                      className="w-16 h-16 mr-4 rounded-xl"
                    />
                  )}
                  {!category.iconUrl && (
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-2xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                    {category.name}
                  </h2>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>
                )}

                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-gray-800">Available Services:</h3>
                  {category.serviceTypes.length > 0 ? (
                    <ul className="space-y-2">
                      {category.serviceTypes.slice(0, 3).map((serviceType) => (
                        <li key={serviceType.id} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                          {serviceType.name}
                        </li>
                      ))}
                      {category.serviceTypes.length > 3 && (
                        <li className="flex items-center text-sm text-indigo-600 font-medium">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                          +{category.serviceTypes.length - 3} more services
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No services available yet</p>
                  )}
                </div>

                <div>
                  <Link
                    href={`/service-categories/${category.id}`}
                    className="group/btn w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 inline-block text-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Explore Services</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Available</h3>
            <p className="text-gray-600 text-lg">Service categories will appear here once they're added.</p>
          </div>
        )}
      </div>
    </div>
  );
}
