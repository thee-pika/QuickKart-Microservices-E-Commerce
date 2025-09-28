"use client";
import { useQueryClient } from '@tanstack/react-query';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import { useAuthStore } from 'apps/user-ui/src/store/authStore';
import { Heart, Search, ShoppingCart, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import HeaderBottom from './headerBottom';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wishList = useStore((state) => state.wishList);
  const cart = useStore((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleSearch = () => {
    if (!searchQuery?.trim()) return;
  }

  const { user } = useUser();

  const logoutHandler = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    queryClient.setQueryData(["user"], null);

    useAuthStore.getState().setLoggedIn(false);

    toast.success("LogOut Successful!!");

    setIsDropdownOpen(false);

    router.push("/login");
  };

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] mx-auto py-4 flex items-center justify-between">
        <div className="h-12 flex items-center">
          <Link href={"/"}>
            <Image
              src="/logo.png"
              alt="logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="w-[50%] flex items-center gap-2">
          <div className="flex w-full">
            <input
              type="text"
              value={searchQuery as string}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products ..."
              className="w-full border-[#345635] outline-none h-[55px] px-4 border-[2.5px] font-Poppins rounded-l-md"
            />
            <button className="bg-[#345635] hover:bg-[#2a432a] text-white px-4 flex items-center justify-center rounded-r-md border-[2.5px] border-[#345635] border-l-0"
              onClick={handleSearch}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-6">
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="bg-gray-50 rounded-full px-2 py-2 border-2 border-gray-200 flex items-center justify-center"
                  >
                    <UserRound />
                  </button>
                  <span>Hey👋 {user.name}</span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-md border z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user?.email ?? "No Email"}
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={logoutHandler}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Link
                  href="/login"
                  className="px-4 py-2 border-2 border-[#345635] text-[#345635] rounded-md hover:bg-[#345635] hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#345635] text-white rounded-md hover:bg-[#2a432a] transition ml-4"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>

          <Link href={"/wishlist"}>
            <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
              <Heart className="transition-colors duration-200 group-hover:text-[#345635]" />
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {wishList?.length}
              </span>
            </div>
          </Link>

          <Link href={"/cart"}>
            <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
              <ShoppingCart className="transition-colors duration-200 group-hover:text-[#345635]" />
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cart?.length}
              </span>
            </div>
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-300">
        <HeaderBottom />
      </div>
      <Toaster />
    </div>
  );
};

export default Header;
