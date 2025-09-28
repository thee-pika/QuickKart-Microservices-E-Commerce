"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { reset } from "canvas-confetti";

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data: any) => {
    setMessage(null);
    try {
      setLoading(true);
      changePasswordMutation.mutate(data);
      setMessage("Password changed successfully ✅");
      reset();
    } catch (err) {
      setMessage("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const changePasswordMutation = useMutation<AxiosResponse<any>, Error, any>({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/reset-password-user`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reset-password-user"] });
    },
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 bg-white rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            {...register('currentPassword', { required: 'currentPassword is required' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="current Password"

          />
          {
            errors.currentPassword?.message && (
              <p>
                {String(errors.currentPassword.message)}
              </p>
            )
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            {...register('newPassword', {
              required: 'newPassword is required',
              minLength: {
                value: 6,
                message: "Must be at least 8 characters."
              },
              validate: {
                hasLower: (value) => /[a-z]/.test(value) || "Must include a lowercase letter.",
                hasUpper: (value) => /[A-Z]/.test(value) || "Must include a uppercase letter.",
                hasNumber: (value) => /\d/.test(value) || "Must include a number .",
              }
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="new Password"
          />
          {
            errors.newPassword?.message && (
              <p>
                {String(errors.newPassword.message)}
              </p>
            )
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'confirm Password is required',
              minLength: {
                value: 8,
                message: "Must be at least 8 characters."
              },
              validate: (value) => value === watch("newPassword") || "Passwords don't match"
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Re enter the new Password"

          />
          {
            errors.confirmPassword?.message && (
              <p>
                {String(errors.confirmPassword.message)}
              </p>
            )
          }
        </div>

        {message && (
          <p className="text-sm text-center font-medium text-gray-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
