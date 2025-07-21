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

  const handleRequestService = (serviceTypeId: string) => {
    const token = localStorage.getItem('firebaseIdToken');
    if (!token) {
      router.push('/auth/email-password');
      return;
    }
    
    router.push(`/request-service/${serviceTypeId}`);
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/service-categories" 
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">Choose a service to request</p>
        </div>

        {serviceTypes.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No services available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceTypes.map((serviceType) => (
              <div key={serviceType.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{serviceType.name}</h3>
                
                {serviceType.description && (
                  <p className="text-gray-600 mb-4">{serviceType.description}</p>
                )}

                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {serviceType.baseFareType.replace('_', ' ').toLowerCase()}
                  </span>
                </div>

                <button
                  onClick={() => handleRequestService(serviceType.id)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Request This Service
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

