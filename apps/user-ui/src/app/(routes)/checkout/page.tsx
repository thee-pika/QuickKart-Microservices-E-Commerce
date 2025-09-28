"use client";
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import CheckOutForm from 'apps/user-ui/src/shared/components/checkout/checkoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const CheckoutPage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [coupon, setCoupon] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        fetchSessionAndClientSecret(storedToken as string);
    }, []);

    const sessionId = searchParams.get("sessionId");

    const fetchSessionAndClientSecret = async (token: string) => {
        setLoading(true);
        if (!sessionId) {
            setError("Invalid session, Please try again.");
            setLoading(false);
            return;
        }

        try {
            const verifyRes = await axiosInstance.get(`/order/api/verify-payment-session?sessionId=${sessionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { totalAmount, sellers, cart, coupon } = verifyRes.data.session;

            if (!sellers || sellers.length === 0 || totalAmount === undefined || totalAmount === null) {
                throw new Error("Invalid payment session data.")
            }

            setCartItems(cart);
            setCoupon(coupon);

            const sellerStripeAccountId = sellers?.[0]?.sellers?.stripeId;

            const intentRes = await axiosInstance.post("/order/api/create-payment-intent", {
                amount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
                sellerStripeAccountId,
                sessionId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setClientSecret(intentRes.data.clientSecret);

        } catch (error) {

            setError("Something went wrong while preparing your payment.")
        } finally {
            setLoading(false);
        }
    }

    const appearance: Appearance = {
        theme: "stripe"
    }

    if (loading) {

        return (
            <div>
                <div>
                    loading...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <div>
                    <div>
                        <XCircle />
                    </div>
                    <h2>
                        Payment Failed
                    </h2>
                    <p>
                        {error} <br /> Please go back and try checking out again.
                    </p>
                    <button
                        onClick={() => router.push("/cart")}
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        )
    }

    return (
        clientSecret && (
            <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance }}
            >
                <CheckOutForm
                    clientSecret={clientSecret}
                    cartItems={cartItems}
                    coupon={coupon}
                    sessionId={sessionId}
                />
            </Elements>
        )
    )
}

export default CheckoutPage;
