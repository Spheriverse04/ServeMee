// frontend/src/app/my-services/edit/[serviceId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  isActive: boolean;
  imageUrl?: string; // Add imageUrl to the interface
}

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // Use string for input, convert later
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State to hold existing image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold new image file

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

        const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Service not found or you do not have permission to edit it.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch service details.');
        }

        const data = await response.json();
        const service: Service = data.service; // Assuming response wraps service in an object

        setName(service.name);
        setDescription(service.description);
        setPrice(service.price.toString()); // Convert number back to string for input field
        setCategory(service.category || '');
        setIsActive(service.isActive);
        setImageUrl(service.imageUrl || null); // Set existing image URL

      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message || 'An unexpected error occurred while fetching service details.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Optional: Display a preview of the new image
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   setImageUrl(reader.result as string);
      // };
      // reader.readAsDataURL(e.target.files[0]);
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
      formData.append('price', parsedPrice.toString()); // Ensure it's a string for FormData
      formData.append('isActive', isActive.toString());
      if (category.trim()) {
        formData.append('category', category.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile); // Append the new image file
      }

      const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set 'Content-Type': 'multipart/form-data' here.
          // The browser will set it automatically with the correct boundary
          // when you send FormData.
        },
        body: formData, // Send FormData
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

  if (error && !formSuccess) { // Show general error if no form success message
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category (Optional):
            </label>
            <input
              type="text"
              id="category"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
            />
          </div>

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

