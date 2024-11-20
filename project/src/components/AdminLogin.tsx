import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

interface LoginFormData {
  username: string;
  password: string;
}

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await axios.post('http://localhost:3000/api/admin/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Login successful!');
      onLoginSuccess(data.token);
    },
    onError: () => {
      toast.error('Invalid credentials');
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            {...register('username', { required: 'Username is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.username && (
            <span className="text-red-500 text-sm">{errors.username.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password.message}</span>
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
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </motion.button>
      </form>
    </motion.div>
  );
}