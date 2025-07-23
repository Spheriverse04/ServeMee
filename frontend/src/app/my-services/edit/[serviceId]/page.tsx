// frontend/src/app/my-services/edit/[serviceId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  serviceTypes?: ServiceType[]; // Service types might be included when fetching categories
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  // category?: string; // This might be a string name, but we need categoryId for backend - REMOVED
  categoryId: string; // Add categoryId
  serviceTypeId: string; // Add serviceTypeId
  isActive: boolean;
  imageUrl?: string;
}

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  // const [category, setCategory] = useState(''); // This state might still be useful for initial display if backend sends category name directly - REMOVED
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // New states for Category and Service Type selection
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<ServiceType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Function to fetch all service categories
  const fetchAllCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      const response = await fetch(`http://localhost:3000/service-categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service categories.');
      }
      const data = await response.json();
      setAllCategories(data);
    } catch (err: any) {
      console.error('Error fetching all categories:', err);
      setError(err.message || 'An unexpected error occurred while fetching categories.');
    }
  }, []);

  // Function to fetch service types based on category ID
  const fetchServiceTypesByCategory = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setAvailableServiceTypes([]);
      return;
    }
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      const response = await fetch(`http://localhost:3000/service-types/by-category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch service types.');
      }
      const data = await response.json();
      setAvailableServiceTypes(data);
    } catch (err: any) {
      console.error('Error fetching service types by category:', err);
      setError(err.message || 'An unexpected error occurred while fetching service types.');
      setAvailableServiceTypes([]); // Clear types on error
    }
  }, []);


  useEffect(() => {
    if (!serviceId) {
      setError('Service ID is missing.');
      setLoading(false);
      return;
    }

    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          router.push('/auth/email-password');
          return;
        }

        // Fetch service details
        const serviceResponse = await fetch(`http://localhost:3000/services/${serviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!serviceResponse.ok) {
          if (serviceResponse.status === 404) {
            throw new Error('Service not found or you do not have permission to edit it.');
          }
          const errorData = await serviceResponse.json();
          throw new Error(errorData.message || 'Failed to fetch service details.');
        }

        const data = await serviceResponse.json();
        const service: Service = data.service;

        setName(service.name);
        setDescription(service.description);
        setPrice(service.price != null && !isNaN(Number(service.price)) ? service.price.toString() : '');
        // setCategory(service.category || ''); // Keep if you display category name - REMOVED
        setIsActive(service.isActive);
        setImageUrl(service.imageUrl || null);

        // Set selected category and service type from fetched service
        if (service.categoryId) {
          setSelectedCategoryId(service.categoryId);
          // Immediately fetch service types for the pre-selected category
          await fetchServiceTypesByCategory(service.categoryId);
        }
        if (service.serviceTypeId) {
          setSelectedServiceTypeId(service.serviceTypeId);
        }

      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message || 'An unexpected error occurred while fetching service details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCategories(); // Fetch all categories when the component mounts
    fetchServiceDetails();
  }, [serviceId, router, fetchAllCategories, fetchServiceTypesByCategory]); // Include dependencies

  // Effect to fetch service types whenever selectedCategoryId changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchServiceTypesByCategory(selectedCategoryId);
      setSelectedServiceTypeId(''); // Reset service type when category changes
    } else {
      setAvailableServiceTypes([]);
      setSelectedServiceTypeId('');
    }
  }, [selectedCategoryId, fetchServiceTypesByCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFormSuccess(null);

    // Basic client-side validation
    if (!name.trim() || !description.trim() || price === '') {
      setError('Please fill in all required fields (Name, Description, Price).');
      setSubmitting(false);
      return;
    }

    if (!selectedCategoryId) {
      setError('Please select a Service Category.');
      setSubmitting(false);
      return;
    }

    if (!selectedServiceTypeId) {
      setError('Please select a Service Type.');
      setSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid non-negative price.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        router.push('/auth/email-password');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      //formData.append('price', parsedPrice.toString());
      formData.append('isActive', isActive.toString());
      formData.append('baseFare', parsedPrice.toString()); 
      //formData.append('categoryId', selectedCategoryId); // Append selected category ID
      formData.append('serviceTypeId', selectedServiceTypeId); // Append selected service type ID

      // if (category.trim()) { // If you still use `category` for the name, append it - REMOVED
      //   formData.append('category', category.trim());
      // }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update service.');
      }

      setFormSuccess('Service updated successfully!');
      // Optionally, refetch service details or update local state
      // For now, let's just show success and allow navigation back
      // setTimeout(() => router.push('/my-services'), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      console.error('Error updating service:', err);
      setError(err.message || 'An unexpected error occurred while updating the service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading service details...</p>
      </div>
    );
  }

  if (error && !formSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/my-services')}
            className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to My Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Edit Service
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Service Name:
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description:
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={submitting}
            ></textarea>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (₹):
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          {/* New Service Category Dropdown */}
          <div>
            <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">
              Service Category:
            </label>
            <select
              id="serviceCategory"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
              disabled={submitting || allCategories.length === 0}
            >
              <option value="">Select a category</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* New Service Type Dropdown (conditionally rendered) */}
          {selectedCategoryId && (
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                Service Type:
              </label>
              <select
                id="serviceType"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                value={selectedServiceTypeId}
                onChange={(e) => setSelectedServiceTypeId(e.target.value)}
                required
                disabled={submitting || availableServiceTypes.length === 0}
              >
                <option value="">Select a service type</option>
                {availableServiceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image Upload Field */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Service Image (Optional):
            </label>
            {imageUrl && !imageFile && ( // Display existing image if no new file is selected
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <img
                  src={imageUrl}
                  alt="Current Service"
                  className="max-w-full h-40 object-contain border border-gray-300 rounded-md"
                />
              </div>
            )}
            {imageFile && ( // Display preview of newly selected image
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                  <img
                      src={URL.createObjectURL(imageFile)}
                      alt="New Service Preview"
                      className="max-w-full h-40 object-contain border border-gray-300 rounded-md"
                  />
                </div>
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              onChange={handleImageChange}
              disabled={submitting}
            />
             <p className="mt-2 text-xs text-gray-500">
                Leave blank to keep the current image. Select a new file to replace it.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={submitting}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Service is Active
            </label>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {formSuccess && <p className="text-green-600 text-sm text-center">{formSuccess}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Service'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/my-services')}
            className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={submitting}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
