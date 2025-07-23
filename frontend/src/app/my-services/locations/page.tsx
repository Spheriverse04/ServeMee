'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface Country {
  id: string;
  name: string;
}

interface State {
  id: string;
  name: string;
  countryId: string;
}

interface District {
  id: string;
  name: string;
  stateId: string;
}

interface Locality {
  id: string;
  name: string;
  districtId: string;
}

export default function MyServiceLocationsPage() {
  const router = useRouter();

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedLocalityId, setSelectedLocalityId] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('firebaseIdToken') : null;

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/countries');
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      toast.error('Failed to load countries.');
    }
  }, []);

  const fetchStates = useCallback(async (countryId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/states?countryId=${countryId}`);
      const data = await res.json();
      setStates(data);
    } catch (err) {
      toast.error('Failed to load states.');
    }
  }, []);

  const fetchDistricts = useCallback(async (stateId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/districts?stateId=${stateId}`);
      const data = await res.json();
      setDistricts(data);
    } catch (err) {
      toast.error('Failed to load districts.');
    }
  }, []);

  const fetchLocalities = useCallback(async (districtId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/localities?districtId=${districtId}`);
      const data = await res.json();
      setLocalities(data);
    } catch (err) {
      toast.error('Failed to load localities.');
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
      setSelectedStateId('');
      setSelectedDistrictId('');
      setSelectedLocalityId('');
      setStates([]);
      setDistricts([]);
      setLocalities([]);
    }
  }, [selectedCountryId, fetchStates]);

  useEffect(() => {
    if (selectedStateId) {
      fetchDistricts(selectedStateId);
      setSelectedDistrictId('');
      setSelectedLocalityId('');
      setDistricts([]);
      setLocalities([]);
    }
  }, [selectedStateId, fetchDistricts]);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchLocalities(selectedDistrictId);
      setSelectedLocalityId('');
    }
  }, [selectedDistrictId, fetchLocalities]);

  const handleSubmit = async () => {
    if (!selectedLocalityId) {
      toast.error('Please select an area/locality.');
      return;
    }

    const confirm = window.confirm(`Assign yourself to this area?`);
    if (!confirm) return;

    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:3000/service-providers/localities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          localityIds: [selectedLocalityId],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to assign locality');
      }

      toast.success('Area successfully assigned!');
      setSelectedCountryId('');
      setSelectedStateId('');
      setSelectedDistrictId('');
      setSelectedLocalityId('');
    } catch (err: any) {
      toast.error(err.message || 'Error saving locality.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Assign Service Area</h1>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        <div>
          <label className="block mb-1 font-medium text-gray-800">Country</label>
          <select
            value={selectedCountryId}
            onChange={(e) => setSelectedCountryId(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
          >
            <option value="">-- Select Country --</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {states.length > 0 && (
          <div>
            <label className="block mb-1 font-medium text-gray-800">State</label>
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {districts.length > 0 && (
          <div>
            <label className="block mb-1 font-medium text-gray-800">District</label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedDistrictId && (
          <div>
            <label className="block mb-1 font-medium text-gray-800">Area / Locality</label>
            {localities.length > 0 ? (
              <select
                value={selectedLocalityId}
                onChange={(e) => setSelectedLocalityId(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
              >
                <option value="">-- Select Area/Locality --</option>
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-red-500 mt-1">No localities found for this district.</p>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSaving || !selectedLocalityId}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Assign Area'}
        </button>
      </div>
    </div>
  );
}

