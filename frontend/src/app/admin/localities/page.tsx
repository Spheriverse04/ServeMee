'use client';

import { useState, useEffect } from 'react';
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
}

export default function AdminLocalityManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  const [editingLocalityId, setEditingLocalityId] = useState<string | null>(null);
  const [editingLocalityName, setEditingLocalityName] = useState('');

  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('firebaseIdToken') : null;

  const fetchLocalities = async (districtId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/localities?districtId=${districtId}`);
      if (!res.ok) throw new Error('Failed to fetch localities');
      const data = await res.json();
      setLocalities(data);
    } catch (err) {
      toast.error('Failed to load localities.');
    }
  };

  useEffect(() => {
    fetch('http://localhost:3000/countries')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => toast.error('Failed to load countries.'));
  }, []);

  useEffect(() => {
    if (!selectedCountryId) return;
    fetch(`http://localhost:3000/states?countryId=${selectedCountryId}`)
      .then(res => res.json())
      .then(setStates)
      .catch(() => toast.error('Failed to load states.'));
  }, [selectedCountryId]);

  useEffect(() => {
    if (!selectedStateId) return;
    fetch(`http://localhost:3000/districts?stateId=${selectedStateId}`)
      .then(res => res.json())
      .then(setDistricts)
      .catch(() => toast.error('Failed to load districts.'));
  }, [selectedStateId]);

  useEffect(() => {
    if (!selectedDistrictId) return;
    fetchLocalities(selectedDistrictId);
  }, [selectedDistrictId]);

  const handleCreateLocality = async () => {
    if (!newAreaName.trim() || !selectedDistrictId) {
      toast.error('Please fill in all fields.');
      return;
    }

    const confirmed = window.confirm(`Create locality "${newAreaName}" under selected district?`);
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/localities/${selectedDistrictId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newAreaName.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create locality');
      }

      toast.success(`Locality "${newAreaName}" created.`);
      setNewAreaName('');
      fetchLocalities(selectedDistrictId);
    } catch (err: any) {
      toast.error(err.message || 'Error creating locality.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocality = async (localityId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/localities/${localityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingLocalityName.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update locality');
      }

      toast.success('Locality updated.');
      setEditingLocalityId(null);
      setEditingLocalityName('');
      fetchLocalities(selectedDistrictId);
    } catch (err: any) {
      toast.error(err.message || 'Error updating locality.');
    }
  };

  const handleDeleteLocality = async (localityId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this locality?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/localities/${localityId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete locality');
      }

      toast.success('Locality deleted.');
      fetchLocalities(selectedDistrictId);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting locality.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Manage Localities</h1>

      <div className="bg-white p-6 rounded-lg shadow border space-y-6">
        {/* Country Dropdown */}
        <div>
          <label className="block font-medium mb-1 text-gray-800">Country</label>
          <select
            value={selectedCountryId}
            onChange={(e) => {
              setSelectedCountryId(e.target.value);
              setSelectedStateId('');
              setSelectedDistrictId('');
              setLocalities([]);
            }}
            className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
          >
            <option value="">-- Select Country --</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* State Dropdown */}
        {states.length > 0 && (
          <div>
            <label className="block font-medium mb-1 text-gray-800">State</label>
            <select
              value={selectedStateId}
              onChange={(e) => {
                setSelectedStateId(e.target.value);
                setSelectedDistrictId('');
                setLocalities([]);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* District Dropdown */}
        {districts.length > 0 && (
          <div>
            <label className="block font-medium mb-1 text-gray-800">District</label>
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

        {/* New Locality Input */}
        {selectedDistrictId && (
          <>
            <div>
              <label className="block font-medium mb-1 text-gray-800">New Area Name</label>
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm text-gray-800"
                placeholder="Enter new locality name"
              />
            </div>

            <button
              onClick={handleCreateLocality}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add Locality'}
            </button>
          </>
        )}
      </div>

      {/* Existing Localities List */}
      {localities.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Existing Localities in Selected District</h2>
          <ul className="space-y-2 text-gray-800">
            {localities.map((l) => (
              <li key={l.id} className="flex items-center justify-between">
                {editingLocalityId === l.id ? (
                  <div className="flex gap-2 items-center w-full">
                    <input
                      value={editingLocalityName}
                      onChange={(e) => setEditingLocalityName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                    <button
                      onClick={() => handleEditLocality(l.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLocalityId(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <span>{l.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLocalityId(l.id);
                          setEditingLocalityName(l.name);
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocality(l.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

