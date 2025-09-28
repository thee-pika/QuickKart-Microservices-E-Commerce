'use client';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  const loginMutation = useMutation<AxiosResponse<any>, Error, any>({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/login-user`,
        data
      );
      localStorage.setItem('accessToken', response.data.accessToken.replace(/^"|"$/g, ''));
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response;
    },
    onSuccess: (_, formData: any) => {
      router.push('/');
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#E3EFD3]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login to Quickkart
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635] pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message as string}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[#345635] font-semibold text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#345635] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#2b462b] transition"
          >
            {loginMutation.isPending ? 'logging In...' : 'Login'}
          </button>
        </form>
       
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link
            href="/signup"
            className="text-[#345635] font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
