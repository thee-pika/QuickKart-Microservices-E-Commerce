'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

type FormData = {
  email: string;
  otp: string;
  name: string;
  password: string;
};

interface UserData {
  name: string;
  email: string;
  password: string;
}

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [userData, setUserData] = useState<UserData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const onSubmit = (data: any) => {
    signUpMutation.mutate(data);
  };


  const verifyOtpMutation = useMutation<AxiosResponse<any>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/verify-user`,
        data
      );

      return response;
    },
    onSuccess: (_, formData) => {

      router.push('/login');
    },
  });

  const signUpMutation = useMutation<AxiosResponse<any>, Error, UserData>({
    mutationFn: async (data: UserData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/user-registration`,
        data
      );
      return response;
    },
    onSuccess: (_, formData: any) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(0);
      startResendTimer();
    },
  });

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 4) {
      alert('Please enter all 4 digits of the OTP');
      return;
    }

    verifyOtpMutation.mutate({
      email: userData?.email || '',
      otp: enteredOtp,
      name: userData?.name as string,
      password: userData?.password as string,
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#E3EFD3]">
      {!showOtp ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Create Your Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635] pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={signUpMutation.isPending}
              className="w-full bg-[#345635] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#2b462b] transition"
            >
              {signUpMutation.isPending ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#345635] font-medium hover:underline"
            >
              LogIn
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 w-[480px]">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Enter OTP
          </h2>
          <p className="text-center text-gray-600 mb-6">
            We have sent a 6-digit code to your email.
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp?.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                />
              ))}
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-red-500 text-sm text-center">
                Please enter all 4 digits of the OTP.
              </p>
            )}
            <div className="flex justify-between">
              <button
                type="button"
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowOtp(false)}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#345635] text-white py-2 px-4 rounded-lg hover:bg-[#2b462b] transition"
              >
                Verify OTP
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Didn’t receive the code?{' '}
            <button
              type="button"
              onClick={() => console.log('Resend OTP')}
              className="text-[#345635] font-medium hover:underline"
            >
              Resend OTP
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
