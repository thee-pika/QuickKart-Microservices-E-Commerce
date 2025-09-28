"use client";
import { useStore } from 'apps/user-ui/src/store';
import { CheckCircle, Truck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import confetti from "canvas-confetti";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();

  useEffect(() => {
    useStore.setState({ cart: [] });

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    })
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-6">
    
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>


        <h2 className="text-2xl font-semibold text-gray-800">
          Payment Successful 🎉
        </h2>


        <p className="text-gray-600">
          Thank you for your purchase. Your order has been placed successfully!
        </p>

 
        <button
          onClick={() => router.push(`/profile?active=My+Orders`)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <Truck className='w-5 h-5' />
          Track My Order
        </button>

    
        {sessionId && (
          <div className="text-sm text-gray-500">
            Payment Session ID: <span className="font-mono text-gray-700">{sessionId}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccessPage;
