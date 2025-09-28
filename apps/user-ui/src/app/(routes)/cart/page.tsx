"use client";
import { useStore } from 'apps/user-ui/src/store';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Loader2, Trash2 } from "lucide-react";
import { useLocationTracking } from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CartPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [selectedAddressId, setselectedAddressId] = useState<string>("")
  const { user } = useUser();
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const productId = cart[0].id;

  const subtotal = cart.reduce((sum: any, item: any) => sum + item.salePrice * item.quantity, 0);


  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const createPaymentSession = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/order/api/create-payment-session", {
        cart, selectedAddressId,
        coupon: couponCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const sessionId = res.data.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`)
    } catch (error) {
      toast.error("some error occured!")
    } finally {
      setLoading(false);
    }
  }

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishList: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishList: state.cart.map((item: any) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  };

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["shipping-addresses", token],
    queryFn: async () => {
      const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/shipping-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.address;
    },
    enabled: !!token
  })

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setselectedAddressId(defaultAddr.id)
      }
    }
  }, [addresses, selectedAddressId])

  const handleCouponCodeChange = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/product/api/apply-discount-code", {
        productId: productId,
        code: couponCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const discnt = res.data.discount;
      if (discnt?.discountType === "percentage") {

        const discountValue = (subtotal * discnt.discountValue) / 100;

        setDiscountAmount(discountValue);

      } else if (discnt?.discountType === "fixed") {
        setDiscountAmount(discnt.discountValue);
      }
      else {
        setDiscountAmount(0);
      }

      setDiscountPercent(discnt?.discountValue);

    } catch (error) {
      toast.error("some error occured!")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-10">
      <div className="md:w-[80%] w-[95%] mx-auto">
        <div className="pb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cart</h1>
          <div className="text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:underline text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Cart</span>
          </div>

          <div className="w-[100%] mx-auto flex gap-2 border ">
            <div className='w-[70%]'>
              {cart.length === 0 ? (
                <div className="text-center text-gray-600 text-lg bg-white py-10 rounded-lg shadow">
                  Your Cart is empty! Start adding products.
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-4 px-6 font-semibold text-gray-700">Product</th>
                        <th className="py-4 px-6 font-semibold text-gray-700">Price</th>
                        <th className="py-4 px-6 font-semibold text-gray-700">Quantity</th>
                        <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <Image
                              src={item.images[0].file_url}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                            />
                            <span className="font-medium text-gray-800">{item.title}</span>
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-semibold">
                            ${item?.salePrice.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center border rounded-lg w-max">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-l"
                              >
                                −
                              </button>
                              <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-r"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 flex gap-3 ">
                            <button
                              onClick={() => removeFromCart(item.id, user, location, deviceInfo)}
                              className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                            >
                              <Trash2 size={18} />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="w-[30%] bg-white shadow-md rounded-lg p-6 flex-shrink-0 space-y-6">
              <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Have a Coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter a coupon code"
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition" onClick={handleCouponCodeChange}>
                    Apply
                  </button>

                </div>
              </div>

              <div className="space-y-2">
                <h4 className="block text-sm font-medium text-gray-600">Select Shipping Address</h4>
                {
                  addresses?.length > 0 && (
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedAddressId}
                      onChange={(e) => setselectedAddressId(e.target.value)}
                    >
                      {
                        addresses?.map((address: any) => (
                          <option key={address.id} value={address.id}>{address.city}, {address.country}</option>
                        ))
                      }
                    </select>
                  )
                }
                {
                  addresses.length === 0 && (
                    <p>Please add an address from profile to create an order!</p>
                  )
                }
              </div>

              <hr className='my-4 text-slate-200' />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Select Payment Method</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Online Payment</option>
                  <option>Cash on Delivery</option>
                </select>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Discount Applied</span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4">
                <span>Total</span>
                <span>${(subtotal - discountAmount).toFixed(2)}</span>
              </div>

              <button
                onClick={createPaymentSession}
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-3 w-full font-medium transition"
              >
                {loading && <Loader2 className='animate-spin w-5 h-5 ' />}
                {loading ? "Redirecting ..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
