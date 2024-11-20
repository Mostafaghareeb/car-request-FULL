import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import TripList from './TripList';

export default function SearchTrips() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/trips');
      return data;
    },
  });

  const filteredTrips = trips.filter((trip: any) =>
    Object.values(trip).some(
      value =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          placeholder="Search by name, phone, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-600"
          >
            Loading trips...
          </motion.div>
        ) : (
          <TripList trips={filteredTrips} />
        )}
      </AnimatePresence>
    </div>
  );
}