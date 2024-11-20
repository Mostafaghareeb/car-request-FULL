import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import AdminLogin from './AdminLogin';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/admin/stats', axiosConfig);
      return data;
    },
    enabled: !!token,
  });

  const { data: recentTrips = [] } = useQuery({
    queryKey: ['recent-trips'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/trips');
      return data;
    },
    enabled: !!token,
  });

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Failed to load dashboard data</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            setToken(null);
          }}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bookings', value: stats?.totalBookings },
          { label: 'Active Trips', value: stats?.activeTrips },
          { label: 'Completed Trips', value: stats?.completedTrips },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Bookings Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.bookingTrends || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="space-y-4">
          {recentTrips.slice(0, 5).map((trip: any) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b border-gray-100 pb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{trip.name}</p>
                  <p className="text-sm text-gray-600">{trip.destination}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(trip.startDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className="text-blue-600 text-sm">
                  {format(new Date(trip.createdAt), 'HH:mm')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}