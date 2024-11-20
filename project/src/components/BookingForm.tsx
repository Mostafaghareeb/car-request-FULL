import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

interface BookingFormData {
  name: string;
  phone: string;
  startDate: string;
  endDate: string;
  destination: string;
}

export default function BookingForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BookingFormData) =>
      axios.post('http://localhost:3000/api/trips', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Booking submitted successfully!');
      reset();
    },
    onError: () => {
      toast.error('Failed to submit booking. Please try again.');
    },
  });

  const onSubmit = (data: BookingFormData) => {
    mutation.mutate(data);
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          {...register('phone', { required: 'Phone number is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.phone && (
          <span className="text-red-500 text-sm">{errors.phone.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          {...register('startDate', { required: 'Start date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.startDate && (
          <span className="text-red-500 text-sm">{errors.startDate.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          {...register('endDate', { required: 'End date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.endDate && (
          <span className="text-red-500 text-sm">{errors.endDate.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Destination</label>
        <input
          type="text"
          {...register('destination', { required: 'Destination is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.destination && (
          <span className="text-red-500 text-sm">{errors.destination.message}</span>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={mutation.isPending}
        className={`
          w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${mutation.isPending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Booking'}
      </motion.button>
    </motion.form>
  );
}