// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalServiceProviders: number;
  totalConsumers: number;
  totalServices: number;
  totalServiceRequests: number;
  totalReviews: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('firebaseIdToken');
        if (!token) {
          router.push('/auth/email-password');
          return;
        }

        // Mock data for now - replace with actual API calls
        const mockStats: DashboardStats = {
          totalUsers: 1250,
          totalServiceProviders: 320,
          totalConsumers: 930,
          totalServices: 450,
          totalServiceRequests: 2100,
          totalReviews: 890,
          recentActivity: [
            { type: 'user_registered', message: 'New user John Doe registered', time: '2 minutes ago' },
            { type: 'service_created', message: 'New plumbing service added', time: '15 minutes ago' },
            { type: 'service_completed', message: 'Service request completed', time: '1 hour ago' },
          ]
        };

        setStats(mockStats);
      } catch (err: any) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your ServeMee platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Service Providers</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.totalServiceProviders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Consumers</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalConsumers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Services</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.totalServices}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Service Requests</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.totalServiceRequests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Reviews</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalReviews}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/users" className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center">
            <h3 className="font-semibold">Manage Users</h3>
          </Link>
          <Link href="/admin/service-categories" className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center">
            <h3 className="font-semibold">Service Categories</h3>
          </Link>
          <Link href="/admin/localities" className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center">
            <h3 className="font-semibold">Manage Localities</h3>
          </Link>
          <Link href="/admin/reports" className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 text-center">
            <h3 className="font-semibold">View Reports</h3>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{activity.message}</span>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

