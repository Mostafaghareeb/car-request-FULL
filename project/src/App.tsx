import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Search, XCircle, LayoutDashboard } from 'lucide-react';
import BookingForm from './components/BookingForm';
import CancelTrip from './components/CancelTrip';
import SearchTrips from './components/SearchTrips';
import AdminDashboard from './components/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [activeSection, setActiveSection] = useState<'book' | 'cancel' | 'search' | 'admin' | null>(null);

  const buttons = [
    { id: 'book', label: 'Request a Car', icon: Car },
    { id: 'cancel', label: 'Cancel Trip', icon: XCircle },
    { id: 'search', label: 'Search Trips', icon: Search },
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-blue-800 mb-12">
            Car Booking Service
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {buttons.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setActiveSection(activeSection === id ? null : id as any)}
                className={`
                  p-6 rounded-xl shadow-lg flex items-center justify-center gap-3
                  transition-colors duration-300
                  ${activeSection === id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-6 h-6" />
                <span className="font-semibold">{label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                {activeSection === 'book' && <BookingForm />}
                {activeSection === 'cancel' && <CancelTrip />}
                {activeSection === 'search' && <SearchTrips />}
                {activeSection === 'admin' && <AdminDashboard />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Toaster position="top-right" />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;