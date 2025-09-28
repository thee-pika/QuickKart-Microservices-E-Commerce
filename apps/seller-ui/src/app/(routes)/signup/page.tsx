'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { countries } from 'apps/seller-ui/src/utils/countries';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';

interface SellerData {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
}

type FormData = {
  email: string;
  otp: string;
  name: string;
  password: string;
  phone_number: string;
  country: string;
};

const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const totalSteps = 3;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const signUpMutation = useMutation<AxiosResponse<any>, Error, any>({
    mutationFn: async (data: SellerData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/seller-registration`,
        data
      );
      return response;
    },
    onSuccess: (_, formData: any) => {
      setShowOtp(true);
    },
  });

  const verifyOtpMutation = useMutation<AxiosResponse<any>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/verify-seller`,
        data
      );
      setSellerId(response.data.seller.id);
      return response;
    },

    onSuccess: (_, formData) => {
      setCurrentStep(2);
    },
  });

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 4) {
      alert('Please enter all 4 digits of the OTP');
      return;
    }

    verifyOtpMutation.mutate({
      email: sellerData?.email as string,
      otp: enteredOtp,
      name: sellerData?.name as string,
      password: sellerData?.password as string,
      phone_number: sellerData?.phone_number as string,
      country: sellerData?.country as string,
    });
  };

  const onSubmit = (data: any) => {
    setSellerData(data);
    signUpMutation.mutate({ name: data.name, email: data.email });
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

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/create-stripe-connection-link`,
        { sellerId: sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3EFD3]">
      <div className="absolute top-6 flex items-center gap-4">
        {[...Array(totalSteps)].map((_, index) => {
          const step = index + 1;
          return (
            <div
              key={step}
              className={`flex items-center gap-2 ${
                step <= currentStep
                  ? 'text-[#345635] font-bold'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  step <= currentStep
                    ? 'border-[#345635] bg-[#345635] text-white'
                    : 'border-gray-400'
                }`}
              >
                {step}
              </div>
              <span>
                {step === 1
                  ? 'Create Account'
                  : step === 2
                  ? 'Setup Account'
                  : 'Connect Bank'}
              </span>
              {step < totalSteps && (
                <span
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-[#345635]' : 'bg-gray-300'
                  }`}
                ></span>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-[480px] p-8 bg-white shadow rounded-lg">
        {currentStep === 1 && (
          <>
            {!showOtp ? (
              <div className="bg-white rounded-2xl p-8 w-full ">
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
                      className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#345635]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
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
                      Phone Number
                    </label>
                    <input
                      type="text"
                      {...register('phone_number', {
                        required: 'Phone Number is required',
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
                      placeholder="9856******"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone_number.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      {...register('country', {
                        required: 'Country is required',
                      })}
                      defaultValue=""
                      className="w-full border border-gray-300 outline-0 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#345635] focus:border-[#345635] transition"
                    >
                      <option value="" disabled>
                        Select Your Country
                      </option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country.message as string}
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
                        className="w-full px-4 py-2 border shadow-sm  border-gray-300 outline-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635] pr-12"
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

                  <div className="flex justify-center items-center ">
                    <button
                      type="submit"
                      className="bg-[#345635] text-white py-2 px-4 rounded-lg hover:bg-[#2b462b] transition"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 w-full">
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
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
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
          </>
        )}
        {currentStep === 2 && (
          <CreateShop sellerId={sellerId!} setCurrentStep={setCurrentStep} />
        )}
        {currentStep === 3 && (
          <div>
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              className="bg-blue-600 px-4 py-2 text-white rounded-md cursor-pointer"
              onClick={connectStripe}
            >
              connect stripe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
