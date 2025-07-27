// frontend/src/app/service-categories/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Corrected: Use Next.js Link component

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

      // Service categories are public, no auth required
      const response = await fetch(`${backendUrl}/service-categories`);

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
  }, []);

  useEffect(() => {
    fetchServiceCategories();
  }, [fetchServiceCategories]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Service Categories</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-500">Loading service categories...</p>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link href={`/service-categories/${category.id}`} key={category.id}>
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                {category.iconUrl && (
                  <img src={category.iconUrl} alt={category.name} className="w-16 h-16 mb-4" />
                )}
                <h2 className="text-xl font-semibold text-gray-700 mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Service Categories Found Message */}
      {categories.length === 0 && !loading && !error && (
        <div className="text-center py-20">
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
  );
}
