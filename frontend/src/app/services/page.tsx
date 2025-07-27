'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Country {
  id: string;
  name: string;
}

interface State {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Locality {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  baseFare: number | string;
  imageUrl?: string;
  serviceType?: {
    category?: {
      name: string;
    };
  };
  serviceProvider: {
    user: {
      displayName: string;
      email: string;
      phoneNumber?: string;
    };
  };
}

export default function ServicesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('');

  const [services, setServices] = useState<Service[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/countries')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCountryId) return;
    fetch(`http://localhost:3000/states?countryId=${selectedCountryId}`)
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(console.error);
  }, [selectedCountryId]);

  useEffect(() => {
    if (!selectedStateId) return;
    fetch(`http://localhost:3000/districts?stateId=${selectedStateId}`)
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(console.error);
  }, [selectedStateId]);

  useEffect(() => {
    if (!selectedDistrictId) return;
    fetch(`http://localhost:3000/localities?districtId=${selectedDistrictId}`)
      .then(res => res.json())
      .then(data => setLocalities(data))
      .catch(console.error);
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!selectedLocalityId) return;

    setLoading(true);
    setError(null);
    fetch(`http://localhost:3000/services/by-locality/${selectedLocalityId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      })
      .then(data => setServices(data.services || []))
      .catch((err: any) => {
        console.error('Error fetching services:', err);
        setError('No services available in this area yet. Please try another location.');
      })
      .finally(() => setLoading(false));
  }, [selectedLocalityId]);

  const categories = ['all', ...Array.from(new Set(services.map(s => s.serviceType?.category?.name).filter(Boolean)))];

  const filteredServices = services.filter(service =>
    filteredCategory === 'all' ||
    service.serviceType?.category?.name === filteredCategory
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-500">Find Local Services</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <select
          className="form-select"
          value={selectedCountryId}
          onChange={(e) => {
            setSelectedCountryId(e.target.value);
            setSelectedStateId('');
            setSelectedDistrictId('');
            setSelectedLocalityId('');
            setServices([]);
          }}
        >
          <option value="">Select Country</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedStateId}
          onChange={(e) => {
            setSelectedStateId(e.target.value);
            setSelectedDistrictId('');
            setSelectedLocalityId('');
            setServices([]);
          }}
          disabled={!selectedCountryId}
        >
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedDistrictId}
          onChange={(e) => {
            setSelectedDistrictId(e.target.value);
            setSelectedLocalityId('');
            setServices([]);
          }}
          disabled={!selectedStateId}
        >
          <option value="">Select District</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedLocalityId}
          onChange={(e) => setSelectedLocalityId(e.target.value)}
          disabled={!selectedDistrictId}
        >
          <option value="">Select Locality</option>
          {localities.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {selectedLocalityId && (
        <div className="mb-4">
          <label className="mr-2 font-medium">Category:</label>
          <select
            className="form-select inline-block w-auto"
            value={filteredCategory}
            onChange={(e) => setFilteredCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading services...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : filteredServices.length === 0 ? (
        <p className="text-center text-gray-600">No services found for this locality.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow p-4">
              <div className="h-40 bg-gray-100 rounded mb-4 overflow-hidden">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
              <p className="text-sm text-indigo-600 font-semibold">
                ₹{Number(service.baseFare || 0).toFixed(2)} per service
              </p>
              <div className="text-xs text-gray-500 mt-2">
                By {service.serviceProvider?.user?.displayName || service.serviceProvider?.user?.email || 'Unknown Provider'}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Link
                  href={`/bookings/new/${service.id}`}
                  className="btn-primary text-sm px-4 py-2 text-center"
                >
                  Book Now
                </Link>
                {service.serviceProvider?.user?.phoneNumber ? (
                 <a
  href={`tel:${service.serviceProvider.user.phoneNumber}`}
  className="text-indigo-600 text-sm underline hover:text-indigo-800 text-center flex items-center gap-1 justify-center"
>
  <span>📞</span> <span>Call</span>
</a>

                ) : (
                  <span className="text-xs text-gray-400 text-center">Phone not available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

