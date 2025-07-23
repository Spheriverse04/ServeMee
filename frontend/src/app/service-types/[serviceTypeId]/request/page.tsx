// frontend/src/app/service-types/[serviceTypeId]/request/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Interface for geographical entities
interface GeoEntity {
  id: string;
  name: string;
}

interface CreateServiceRequestForm {
  notes: string;
  scheduledTime: string; // ISO string
  address: string; // This will be a street address, not a locality ID
  localityId: string | null; // This will store the selected locality's ID
}

export default function RequestServicePage() {
  const params = useParams();
  const serviceTypeId = params.serviceTypeId as string;
  const router = useRouter();

  const [formData, setFormData] = useState<CreateServiceRequestForm>({
    notes: '',
    scheduledTime: '',
    address: '',
    localityId: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for cascading dropdowns
  const [countries, setCountries] = useState<GeoEntity[]>([]);
  const [states, setStates] = useState<GeoEntity[]>([]);
  const [districts, setDistricts] = useState<GeoEntity[]>([]);
  const [localities, setLocalities] = useState<GeoEntity[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  const [geoLoading, setGeoLoading] = useState(false); // Loading state for geo data

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  // Helper function to fetch data from backend
  const fetchData = useCallback(async (url: string) => {
    setGeoLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('firebaseIdToken');
      if (!token) {
        router.push('/auth/email-password');
        setError('Authentication token missing. Please log in.');
        setGeoLoading(false);
        return [];
      }

      const response = await fetch(`${backendUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch data from ${url}`);
      }
      return response.json();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching location data.');
      console.error('Error fetching geo data:', err);
      return [];
    } finally {
      setGeoLoading(false);
    }
  }, [backendUrl, router]);

  // Fetch Countries on component mount
  useEffect(() => {
    const getCountries = async () => {
      // NOTE: Replace with your actual /countries API endpoint if you create one
      // For now, simulating a default 'India' or fetching all localities and extracting countries
      // If you implement a dedicated /countries endpoint, use: const data = await fetchData('/countries');
      // For demonstration, let's assume a static India or fetch all localities and group
      // For now, we'll simulate a single country 'India' if no /countries endpoint exists.
      // If a /countries API exists, uncomment the line below and remove the static data.
      // const data = await fetchData('/countries'); // Assumed API
      const data = [{ id: 'india-uuid-1', name: 'India' }]; // Simulated data if no /countries API
      setCountries(data);
      // Set India as default if available
      if (data.length > 0) {
        setSelectedCountryId(data[0].id);
      }
    };
    getCountries();
  }, [fetchData]);

  // Fetch States when country changes
  useEffect(() => {
    const getStates = async () => {
      if (selectedCountryId) {
        // NOTE: Replace with your actual /states API endpoint, filtered by countryId
        // If you implement a dedicated /states?countryId=... endpoint:
        // const data = await fetchData(`/states?countryId=${selectedCountryId}`);
        const data = [ // Simulated data
          { id: 'assam-uuid-1', name: 'Assam' },
          { id: 'delhi-uuid-2', name: 'Delhi' }
        ];
        setStates(data);
        setDistricts([]); // Reset districts
        setLocalities([]); // Reset localities
        setSelectedStateId(null);
        setSelectedDistrictId(null);
        setFormData(prev => ({ ...prev, localityId: null }));
      }
    };
    getStates();
  }, [selectedCountryId, fetchData]);

  // Fetch Districts when state changes
  useEffect(() => {
    const getDistricts = async () => {
      if (selectedStateId) {
        // NOTE: Replace with your actual /districts API endpoint, filtered by stateId
        // If you implement a dedicated /districts?stateId=... endpoint:
        // const data = await fetchData(`/districts?stateId=${selectedStateId}`);
        const data = [ // Simulated data
          { id: 'kamrup-metro-uuid-1', name: 'Kamrup Metropolitan' },
          { id: 'guwahati-east-uuid-2', name: 'Guwahati East' }
        ];
        setDistricts(data);
        setLocalities([]); // Reset localities
        setSelectedDistrictId(null);
        setFormData(prev => ({ ...prev, localityId: null }));
      }
    };
    getDistricts();
  }, [selectedStateId, fetchData]);

  // Fetch Localities when district changes
  useEffect(() => {
    const getLocalities = async () => {
      if (selectedDistrictId) {
        // NOTE: This assumes you will add an endpoint like /localities?districtId=...
        // in your backend's locality.controller.ts and locality.service.ts
        const data = await fetchData(`/localities?districtId=${selectedDistrictId}`);
        setLocalities(data);
        setFormData(prev => ({ ...prev, localityId: null }));
      }
    };
    getLocalities();
  }, [selectedDistrictId, fetchData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryId(e.target.value);
    setSelectedStateId(null);
    setSelectedDistrictId(null);
    setFormData(prev => ({ ...prev, localityId: null }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStateId(e.target.value);
    setSelectedDistrictId(null);
    setFormData(prev => ({ ...prev, localityId: null }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrictId(e.target.value);
    setFormData(prev => ({ ...prev, localityId: null }));
  };

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, localityId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = localStorage.getItem('firebaseIdToken');
    if (!token) {
      router.push('/auth/email-password');
      setLoading(false);
      return;
    }

    if (!formData.localityId) {
      setError('Please select a complete location (Country, State, District, and Area).');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        serviceTypeId,
        notes: formData.notes,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        localityId: formData.localityId, // Now sending localityId
      };

      const response = await fetch(`${backendUrl}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service request');
      }

      setSuccessMessage('Service request created successfully!');
      setFormData({
        notes: '',
        scheduledTime: '',
        address: '',
        localityId: null,
      });
      // Reset dropdowns after successful submission if needed
      setSelectedCountryId(null);
      setSelectedStateId(null);
      setSelectedDistrictId(null);
      setCountries([]); // Re-trigger initial fetch
      // router.push('/my-service-requests'); // Uncomment to redirect
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Error creating service request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Request Service
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Service Type ID: {serviceTypeId}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add any specific notes or requirements for the service (optional)"
              value={formData.notes}
              onChange={handleFormChange}
              disabled={loading}
            />
          </div>

          {/* Scheduled Time */}
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">Scheduled Time</label>
            <input
              id="scheduledTime"
              name="scheduledTime"
              type="datetime-local"
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.scheduledTime}
              onChange={handleFormChange}
              disabled={loading}
              required
            />
          </div>

          {/* Country Dropdown */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <select
              id="country"
              name="country"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedCountryId || ''}
              onChange={handleCountryChange}
              disabled={geoLoading || countries.length === 0}
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <select
              id="state"
              name="state"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedStateId || ''}
              onChange={handleStateChange}
              disabled={geoLoading || !selectedCountryId || states.length === 0}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
            <select
              id="district"
              name="district"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDistrictId || ''}
              onChange={handleDistrictChange}
              disabled={geoLoading || !selectedStateId || districts.length === 0}
              required
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locality (Area) Dropdown */}
          <div>
            <label htmlFor="locality" className="block text-sm font-medium text-gray-700">Area (Locality)</label>
            <select
              id="locality"
              name="localityId"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={formData.localityId || ''}
              onChange={handleLocalityChange}
              disabled={geoLoading || !selectedDistrictId || localities.length === 0}
              required
            >
              <option value="">Select Area</option>
              {localities.map((locality) => (
                <option key={locality.id} value={locality.id}>
                  {locality.name}
                </option>
              ))}
            </select>
          </div>

          {/* Street Address - This is separate from the locality selection */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              id="address"
              name="address"
              type="text"
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="House/Flat No., Street Name, Landmark"
              value={formData.address}
              onChange={handleFormChange}
              disabled={loading}
              required
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
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading || geoLoading || !formData.localityId}
          >
            {loading ? 'Submitting Request...' : 'Submit Service Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
