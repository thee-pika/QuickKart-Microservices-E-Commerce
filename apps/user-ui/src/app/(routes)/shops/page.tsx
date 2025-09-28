"use client";
import { categories } from 'apps/user-ui/src/configs/categories';
import { countries } from 'apps/user-ui/src/configs/countries';
import ShopCard from 'apps/user-ui/src/shared/components/cards/shop-card';
import Loader from 'apps/user-ui/src/shared/components/Loader';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
    const [isShopLoading, setIsShopLoading] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedCategories, setselectedCategories] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [shops, setShops] = useState<any[]>([]);
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        setToken(storedToken);
    }, []);

    const fetchFilteredShops = async () => {
        setIsShopLoading(true);
        try {
            const query = new URLSearchParams();

            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","));
            }

            query.set("page", page.toString());
            query.set("limit", "12");

            const res = await axiosInstance.get(`/product/api/get-filtered-shops/?${query.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setShops(res.data.products);
            setTotalPages(res.data.pagination.totalPages)
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsShopLoading(false);
        }
    }

    const updateURL = () => {
        const params = new URLSearchParams();

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","));
        }

        if (selectedCountries.length > 0) {
            params.set("countries", selectedCountries.join(","));
        }

        params.set("page", page.toString());
        router.replace(`/shops?${decodeURIComponent(params.toString())}`);
    }

    useEffect(() => {
        updateURL();
        fetchFilteredShops();
    }, [selectedCategories, page])


    const toggleCategory = (label: string) => {
        setselectedCategories((prev) => prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label])
    }

    const toggleCountry = (country: string) => {
    
        setSelectedCountries((prev) => prev.includes(country) ? prev.filter((cat) => cat !== country) : [...prev, country])
    }

    return (
        <div className="w-full bg-[#f5f5f5] pb-10">


            <div className="w-[90%] lg:w-[80%] mx-auto flex gap-6">
                <div className="w-[18%] bg-white rounded-lg shadow p-5 space-y-8">


                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Categories
                        </h3>
                        <ul className="space-y-2">
                            {
                                categories?.map((category: any, index) => (
                                    <li key={index}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                onChange={() => toggleCategory(category.value)}
                                                checked={selectedCategories.includes(category.value)}
                                                className="accent-blue-600"
                                            />
                                            <span className="text-sm">{category.value}</span>
                                        </label>
                                    </li>
                                ))
                            }
                        </ul>
                    </aside>

                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Countries
                        </h3>
                        <ul className="space-y-2">
                            {
                                countries?.map((country: any, index) => (
                                    <li key={index}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                onChange={() => toggleCountry(country.name)}
                                                checked={selectedCountries.includes(country.name)}
                                                className="accent-blue-600"
                                            />
                                            <span className="text-sm">{country.name}</span>
                                        </label>
                                    </li>
                                ))
                            }
                        </ul>
                    </aside>


                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">All Shops</h2>
                    {isShopLoading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            {shops?.length > 0 ? shops?.map((p, i) => (
                                <ShopCard key={i} shop={p} />
                            )) : (
                                <div> No Shops Found!!</div>
                            )}
                        </div>
                    )}

                    {
                        totalPages > 1 && (
                            <div>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`px-3 py-1 rounded-md border border-gray-200 ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Page;

