import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react';

interface Trip {
  id: number;
  name: string;
  phone: string;
  startDate: string;
  endDate: string;
  destination: string;
}

interface TripListProps {
  trips: Trip[];
  onCancel?: (id: number) => void;
}

export default function TripList({ trips, onCancel }: TripListProps) {
  return (
    <div className="space-y-4">
      {trips.length === 0 ? (
        <p className="text-center text-gray-600">No trips found</p>
      ) : (
        trips.map((trip) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-4 rounded-lg shadow border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{trip.name}</h3>
                <p className="text-gray-600">{trip.phone}</p>
                <p className="text-gray-600">
                  {format(new Date(trip.startDate), 'MMM dd, yyyy')} - 
                  {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-600">{trip.destination}</p>
              </div>
              {onCancel && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onCancel(trip.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle className="w-6 h-6" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}