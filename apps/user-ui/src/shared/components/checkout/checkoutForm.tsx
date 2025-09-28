import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { useState } from 'react'

const CheckOutForm = ({
    clientSecret,
    cartItems,
    coupon,
    sessionId
}: {
    clientSecret: string,
    cartItems: any[],
    coupon: any,
    sessionId: string | null
}) => {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"success" | "failed" | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const total = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
    const discount = coupon?.discountAmount ?? 0;
    const grandTotal = total - discount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`
            }
        });

        if (result.error as any) {
            setStatus("failed");
            setErrorMsg(result.error.message || "Something went wrong.");
        } else {
            setStatus("success");
        }
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-4">
                    Secure Payment Checkout
                </h2>

                <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <span>{item.quantity} × {item.title}</span>
                                <span>${(item.quantity * item.salePrice).toFixed(2)}</span>
                            </div>
                        ))}

                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount</span>
                                <span>- ${Number(discount).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total</span>
                            <span>${Number(grandTotal).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <PaymentElement />

                <button
                    type='submit'
                    disabled={!stripe || loading}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition'
                >
                    {loading && <Loader2 className='animate-spin w-5 h-5 ' />}
                    {loading ? "Processing..." : "Pay Now"}
                </button>


                {errorMsg && (
                    <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
                        <XCircle className="w-5 h-5" />
                        {errorMsg}
                    </div>
                )}
                {status === "success" && (
                    <div className='flex items-center gap-2 text-green-600 text-sm justify-center'>
                        <CheckCircle className='w-5 h-5' />
                        Payment successful!
                    </div>
                )}
                {status === "failed" && (
                    <div className='flex items-center gap-2 text-red-600 text-sm justify-center'>
                        <XCircle className='w-5 h-5' />
                        Payment failed. Please try again.
                    </div>
                )}
            </form>
        </div>
    )
}

export default CheckOutForm;
