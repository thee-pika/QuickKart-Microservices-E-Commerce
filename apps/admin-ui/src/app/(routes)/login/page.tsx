'use client';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  const loginMutation = useMutation<AxiosResponse<any>, Error, any>({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/api/login-admin`,
        data
      );
      localStorage.setItem('accessToken', response.data.accessToken.replace(/^"|"$/g, ''));
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response;
    },
    onSuccess: () => {
      router.push('/');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-black border border-purple-700 rounded-xl shadow-lg p-8">
      
        <h2 className="text-3xl font-semibold text-center mb-6 text-purple-400">
          Login to <span className="text-purple-500">Quickkart</span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-black border border-purple-700 rounded-lg text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-black border border-purple-700 rounded-lg text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-purple-400 hover:text-purple-200"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-purple-400 mt-6">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-purple-500 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
