// frontend/src/app/services/new/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define interfaces for type safety, matching your backend entities
interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string; // Assuming dates are stringified from backend
  updatedAt: string;
}

export enum BaseFareType {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  PER_KM = 'per_km',
  PER_ITEM = 'per_item',
  CUSTOM = 'custom'
}

interface ServiceType {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  baseFareType: BaseFareType;
  isActive: boolean;
  sortOrder: number;
  additionalAttributes?: Record<string, any>; // Optional, as it's nullable in DB
  createdAt: string;
  updatedAt: string;
}

// Interface for the form data
interface CreateServiceForm {
  name: string;
  description: string;
  baseFare: string; // Use baseFare to match backend Service entity
  serviceTypeId: string; // This will now store the selected ServiceType's ID
  // imageUrl?: string; // Removed, now handled by selectedImageFile and existingImageUrl
}

export default function NewServicePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CreateServiceForm>({
    name: '',
    description: '',
    baseFare: '',
    serviceTypeId: '', // Initialize serviceTypeId
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // State for the selected file object
  const [existingImageUrl, setExistingImageUrl] = useState<string>(''); // State for existing image URL, if any

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // State for selected category
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false); // New state for service types loading

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchServiceCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/service-categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data || []); // Adjust based on your API response structure
    } catch (error: any) {
      console.error('Error fetching service categories:', error);
      setError(`Failed to fetch service categories: ${error.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchServiceTypes = useCallback(async (categoryId: string) => {
    setServiceTypesLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/service-types/by-category/${categoryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServiceTypes(data || []); // Adjust based on your API response structure
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      setError(`Failed to fetch service types: ${error.message}`);
    } finally {
      setServiceTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceCategories();
  }, [fetchServiceCategories]);

  // Handle category selection change
  useEffect(() => {
    if (selectedCategoryId) {
      fetchServiceTypes(selectedCategoryId);
    } else {
      setServiceTypes([]); // Clear service types if no category is selected
    }
    // Reset serviceTypeId when category changes
    setFormData((prevData) => ({
      ...prevData,
      serviceTypeId: '',
    }));
  }, [selectedCategoryId, fetchServiceTypes]);

  // Handle input changes, updating the formData object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'image') {
      setSelectedImageFile(files && files.length > 0 ? files[0] : null);
    } else if (name === 'existingImageUrl') {
        setExistingImageUrl(value);
        setSelectedImageFile(null); // Clear selected file if user is manually entering URL
    }
    else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        router.push('/auth/email-password');
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const formDataToSend = new FormData();

      // Append all form data fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('baseFare', parseFloat(formData.baseFare).toString()); // Convert to string for FormData
      formDataToSend.append('serviceTypeId', formData.serviceTypeId);

      // Append image if selected
      if (selectedImageFile) {
        formDataToSend.append('image', selectedImageFile); // 'image' should match the backend's FileInterceptor field name
      } else if (existingImageUrl) {
        formDataToSend.append('imageUrl', existingImageUrl); // If user provided a URL
      }


      const response = await fetch(`${backendUrl}/services`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json', // Do NOT set Content-Type header when sending FormData; browser sets it automatically with correct boundary
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service.');
      }

      setSuccessMessage('Service created successfully!');
      // Optionally, clear form or redirect
      setFormData({
        name: '',
        description: '',
        baseFare: '',
        serviceTypeId: '',
      });
      setSelectedImageFile(null); // Clear selected file
      setExistingImageUrl(''); // Clear existing image URL
      setSelectedCategoryId(''); // Reset selected category
      setServiceTypes([]); // Clear service types
      router.push('/my-services'); // Redirect to my services page after successful creation
    } catch (error: any) {
      console.error('Error creating service:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Service</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Service Category
            </label>
            <select
              id="category"
              name="category" // This name is for handling selectedCategoryId
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={loading || categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="serviceTypeId" className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              id="serviceTypeId"
              name="serviceTypeId"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={formData.serviceTypeId}
              onChange={handleChange}
              disabled={loading || serviceTypesLoading || !selectedCategoryId}
            >
              <option value="">
                {serviceTypesLoading
                  ? 'Loading service types...'
                  : selectedCategoryId
                  ? 'Select a service type'
                  : 'Select a category first'}
              </option>
              {serviceTypes.map((serviceType) => (
                <option key={serviceType.id} value={serviceType.id}>
                  {serviceType.name} - ({serviceType.baseFareType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="baseFare" className="block text-sm font-medium text-gray-700">
              Base Fare (Price)
            </label>
            <input
              id="baseFare"
              name="baseFare"
              type="number"
              step="0.01" // Allow decimal values
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={formData.baseFare}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Service image (optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*" // Restrict to image files
              className="mt-1 block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleChange}
              disabled={loading}
            />
             {selectedImageFile && (
              <p className="mt-2 text-sm text-gray-500">Selected file: {selectedImageFile.name}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Or provide an image URL:
            </p>
            <input
              id="existingImageUrl"
              name="existingImageUrl"
              type="url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800"
              value={existingImageUrl}
              onChange={handleChange}
              disabled={loading || !!selectedImageFile} // Disable if a file is selected
              placeholder="e.g., https://example.com/image.jpg"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Service...' : 'Create Service'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/my-services" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Back to My Services
          </Link>
        </div>
      </div>
    </div>
  );
}
