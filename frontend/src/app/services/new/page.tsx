// frontend/src/app/services/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface matching your backend's CreateServiceDto (simplified for frontend use)
// Added imageUrl as an optional field
interface CreateServiceForm {
  name: string;
  description: string;
  price: string; // Use string for input to handle decimal correctly before conversion
  category: string;
  imageUrl?: string; // Optional field for service image
}

export default function NewServicePage() {
  const router = useRouter();

  // State to hold form input values using a single object for cleaner management
  const [formData, setFormData] = useState<CreateServiceForm>({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '', // Initialize optional field
  });

  const [loading, setLoading] = useState(false); // Indicates if API call is in progress
  const [error, setError] = useState<string | null>(null); // For displaying API errors
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For displaying success messages

  // Handle input changes, updating the formData object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        setError('Authentication token not found. Please log in.');
        // Redirect to login if no token is found
        router.push('/auth/email-password');
        return;
      }

      // Client-side validation for required fields
      if (!formData.name.trim() || !formData.description.trim() || formData.price === '') {
        setError('Please fill in all required fields (Name, Description, Price).');
        setLoading(false);
        return;
      }

      // Convert price to a number and validate
      const priceAsNumber = parseFloat(formData.price);
      if (isNaN(priceAsNumber) || priceAsNumber < 0) {
        setError('Price must be a valid non-negative number.');
        setLoading(false);
        return;
      }

      // Prepare data for the backend, matching CreateServiceDto
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: priceAsNumber,
        category: formData.category, // Category is optional, send as is
        imageUrl: formData.imageUrl?.trim() || undefined, // Send as undefined if empty or just whitespace
      };

      const response = await fetch('http://localhost:3000/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Attach the Firebase ID Token
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Backend validation errors will be in errorData.message (array or string)
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || 'Failed to create service.';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccessMessage('Service created successfully! Redirecting...');
      console.log('Service created:', result.service);

      // Redirect to the my-services page after successful creation
      setTimeout(() => {
        router.push('/my-services');
      }, 2000); // Redirect after 2 seconds to show success message

    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create New Service
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Provide details for your new service offering.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Service Name:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            ></textarea>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (e.g., 50.00):
            </label>
            <input
              id="price"
              name="price"
              type="number" // Use type="number" for numeric input
              step="0.01" // Allow decimal values
              min="0"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.price}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category:
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL (Optional):
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url" // Use type="url" for URL validation in browser
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={loading}
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
            &larr; Back to My Services
          </Link>
        </div>
      </div>
    </div>
  );
}
