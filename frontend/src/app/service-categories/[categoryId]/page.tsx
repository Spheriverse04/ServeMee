// frontend/src/app/service-categories/[categoryId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  baseFareType: string;
  category: {
    id: string;
    name: string;
  };
}

export default function ServiceTypesPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (categoryId) {
      fetchServiceTypes();
    }
  }, [categoryId]);

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/service-types/by-category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service types');
      }

      const data = await response.json();
      setServiceTypes(data);
      if (data.length > 0) {
        setCategoryName(data[0].category.name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading services...</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 px-4 sm:px-6 lg:px-8">
          <Link 
            href="/service-categories" 
            className="group inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Categories</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{categoryName}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our available services and get connected with verified providers
            </p>
          </div>
        </div>

        {serviceTypes.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center mx-4 sm:mx-6 lg:mx-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600 text-lg">Services in this category will appear here once providers add them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
            {serviceTypes.map((serviceType) => (
              <div key={serviceType.id} className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-white text-2xl font-bold">
                      {serviceType.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                    {serviceType.name}
                  </h3>
                </div>
                
                {serviceType.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{serviceType.description}</p>
                )}

                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {serviceType.baseFareType.replace('_', ' ').toLowerCase()} pricing
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/service-types/${serviceType.id}/request`)}
                  className="group/btn w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Request This Service</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


