// frontend/src/app/service-categories/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define interfaces for better type safety
interface ServiceType {
  id: string;
  name: string;
  description?: string;
  baseFareType: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  serviceTypes: ServiceType[];
}

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchServiceCategories = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

      // ** Retrieve Firebase ID token from localStorage **
      const firebaseIdToken = localStorage.getItem('firebaseIdToken');

      if (!firebaseIdToken) {
        // If no token is found, redirect to login page
        router.push('/auth/email-password');
        setError('Authentication token missing. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/service-categories`, {
        headers: {
          // ** Include the Authorization header with the Bearer token **
          'Authorization': `Bearer ${firebaseIdToken}`,
          'Content-Type': 'application/json', // Assuming your API expects JSON
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service categories');
      }

      const data: ServiceCategory[] = await response.json();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching service categories:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [router]); // Added router to dependency array as it's used inside useCallback

  useEffect(() => {
    fetchServiceCategories();
  }, [fetchServiceCategories]); // Depend on the memoized fetchServiceCategories

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="p-8 rounded-lg shadow-md bg-white text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchServiceCategories} // Allow retrying the fetch
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Explore Our Service Categories
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out group"
              >
                <div className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    {category.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.iconUrl} alt={`${category.name} icon`} className="h-20 w-20 object-contain" />
                    ) : (
                      <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m7-8V3m0 0V2m0 19v-2m0-16h.01M5 11h.01M19 11h.01"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    {category.description || 'No description available.'}
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    {category.serviceTypes.length > 0 ? (
                      category.serviceTypes.map(type => (
                        <li key={type.id} className="flex items-center">
                          <svg className="h-4 w-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {type.name}
                        </li>
                      ))
                    ) : (
                      <li>No specific service types listed yet.</li>
                    )}
                  </ul>
                  <div className="text-center">
                    <Link
                      href={`/services?category=${category.id}`} // Link to a services page, filtered by category
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group/btn"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>Explore Services</span>
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
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
            ))
          ) : (
            <div className="lg:col-span-3 text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m7-8V3m0 0V2m0 19v-2m0-16h.01M5 11h.01M19 11h.01"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Service Categories Found</h2>
              <p className="text-gray-500">
                It looks like there are no service categories available at the moment. Please check back later!
              </p>
            </div>
          )}
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
