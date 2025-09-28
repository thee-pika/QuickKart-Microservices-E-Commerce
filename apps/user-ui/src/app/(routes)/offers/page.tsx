"use client";
import { useQuery } from '@tanstack/react-query';
import ProductCard from 'apps/user-ui/src/shared/components/cards/product-card';
import Loader from 'apps/user-ui/src/shared/components/Loader';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Range } from "react-range";

const MIN = 0;
const MAX = 200000;

const Page = () => {
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 200000]);
    const [selectedCategories, setselectedCategories] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([0, 200000]);
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');

        setToken(storedToken);
    }, []);

    const fetchFilteredProducts = async () => {
        setIsProductLoading(true);
        try {
            const query = new URLSearchParams();
            query.set("priceRange", priceRange.join(","));
            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","));
            }
            if (selectedColors.length > 0) {
                query.set("colors", selectedColors.join(","));
            }

            if (selectedSizes.length > 0) {
                query.set("sizes", selectedSizes.join(","));
            }

            query.set("page", page.toString());
            query.set("limit", "12");

            const res = await axiosInstance.get(`/product/api/get-filtered-events/?${query.toString()}`);

            setProducts(res.data.products);
            setTotalPages(res.data.pagination.totalPages)
        } catch (error) {
        } finally {
            setIsProductLoading(false);
        }
    }

    const colors = [
        { name: "Black", code: "#000000" },
        { name: "White", code: "#FFFFFF" },
        { name: "Red", code: "#FF0000" },
        { name: "Blue", code: "#0000FF" },
        { name: "Green", code: "#008000" },
        { name: "Yellow", code: "#FFFF00" },
        { name: "Orange", code: "#FFA500" },
        { name: "Purple", code: "#800080" },
        { name: "Gray", code: "#808080" },
        { name: "Brown", code: "#A52A2A" },
        { name: "Pink", code: "#FFC0CB" },
        { name: "Cyan", code: "#00FFFF" },
        { name: "Magenta", code: "#FF00FF" },
        { name: "Navy", code: "#000080" },
        { name: "Olive", code: "#808000" },
        { name: "Teal", code: "#008080" }
    ];

    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

    const updateURL = () => {
        const params = new URLSearchParams();
        params.set("priceRange", priceRange.join(","));

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","));
        }
        if (selectedColors.length > 0) {
            params.set("colors", selectedColors.join(","));
        }

        if (selectedSizes.length > 0) {
            params.set("sizes", selectedSizes.join(","));
        }
        params.set("page", page.toString());
        router.replace(`/offers?${decodeURIComponent(params.toString())}`);
    }

    useEffect(() => {
        updateURL();
        fetchFilteredProducts();
    }, [selectedCategories, page])

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories");
                return res.data;
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 1000 * 60 * 30,
        retry: 2
    })

    const toggleCategory = (label: string) => {
        setselectedCategories((prev) => prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label])
    }

    const toggleColor = (color: string) => {

        setSelectedColors((prev) => prev.includes(color) ? prev.filter((cat) => cat !== color) : [...prev, color])
    }

    const toggleSize = (size: string) => {

        setSelectedSizes((prev) => prev.includes(size) ? prev.filter((cat) => cat !== size) : [...prev, size])
    }

    return (
        <div className="w-full bg-[#f5f5f5] pb-10">
            <div className="w-[90%] lg:w-[80%] mx-auto flex gap-6">
                <div className="w-[18%] bg-white rounded-lg shadow p-5 space-y-8">
                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Price Range
                        </h3>
                        <div className="ml-2 my-6">
                            <Range
                                step={1}
                                min={MIN}
                                max={MAX}
                                values={tempPriceRange}
                                onChange={(values: any) => setTempPriceRange(values)}
                                renderTrack={({ props, children }: any) => {
                                    const [min, max] = tempPriceRange;
                                    const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                                    const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                                    return (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                            }}
                                            className="h-[6px] bg-gray-200 rounded relative"
                                        >
                                            <div
                                                className="absolute h-full bg-blue-600 rounded"
                                                style={{
                                                    left: `${percentageLeft}%`,
                                                    width: `${percentageRight - percentageLeft}%`,
                                                }}
                                            />
                                            {children}
                                        </div>
                                    );
                                }}
                                renderThumb={({ props }: any) => {
                                    const { key, ...rest } = props;
                                    return (
                                        <div
                                            key={key}
                                            {...rest}
                                            className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow"
                                        />
                                    );
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm font-medium">
                                ${tempPriceRange[0]} - ${tempPriceRange[1]}
                            </div>
                            <button
                                onClick={() => {
                                    setPriceRange(tempPriceRange);
                                    setPage(1);
                                }}
                                className="text-sm px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </aside>

                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Categories
                        </h3>
                        <ul className="space-y-2">
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : (
                                data?.categories?.map((category: any, index: number) => (
                                    <li key={index}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                onChange={() => toggleCategory(category)}
                                                checked={selectedCategories.includes(category)}
                                                className="accent-blue-600"
                                            />
                                            <span className="text-sm">{category}</span>
                                        </label>
                                    </li>
                                ))
                            )}
                        </ul>
                    </aside>

                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Colors
                        </h3>
                        <ul className="grid grid-cols-4 gap-3">
                            {colors.map((color, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => toggleColor(color.name)}
                                        className={`w-7 h-7 rounded-full border transition-transform duration-200
    ${selectedColors.includes(color.name)
                                                ? "ring-2 ring-offset-2 ring-blue-600 scale-110"
                                                : "border-gray-300"
                                            }`}
                                        style={{ backgroundColor: color.code }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <aside>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Filter By Size
                        </h3>
                        <ul className="grid grid-cols-4 gap-3">
                            {sizes.map((size, index) => (
                                <li key={index}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            onChange={() => toggleSize(size)}
                                            checked={selectedSizes.includes(size)}
                                            className="accent-blue-600"
                                        />
                                        <span className="font-medium">{size}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">Offer Products</h2>
                    {isProductLoading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            {products?.length > 0 ? products?.map((p, i) => (
                                <ProductCard key={i} product={p} />
                            )) : (
                                <div> No Products Found!!</div>
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

