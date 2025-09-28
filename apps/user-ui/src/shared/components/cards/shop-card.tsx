import { ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        description?: string;
        avatar: string;
        coverBanner?: string;
        address?: string;
        category?: string;
        rating?: number;
        followers?: [];
    };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {

    return (
        <div className="w-full max-w-sm rounded-2xl shadow-md border border-gray-100 overflow-hidden bg-white hover:shadow-lg transition">

            <div className="relative h-32 w-full">
                <Image
                    src={
                        shop?.coverBanner && shop.coverBanner.trim() !== ""
                            ? shop.coverBanner
                            : "https://ik.imagekit.io/m3hqvlyteo/products/image.png?updatedAt=1756112127804"
                    }
                    alt="Cover"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="relative flex flex-col items-center -mt-10 px-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <Image
                        src={shop?.avatar[0] && shop.avatar[0].trim() !== "" ? shop.avatar[0] : "https://ik.imagekit.io/m3hqvlyteo/products/image.png?updatedAt=1756112127804"}
                        alt={shop?.name || "Shop Avatar"}
                        width={80}
                        height={80}
                        className="object-cover"
                    />
                </div>

                <div className="mt-3 text-center">
                    <h3 className="text-lg font-semibold">{shop?.name}</h3>
                    <p className="text-sm text-gray-500">
                        {shop?.followers?.length ?? 0} Followers
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-600">
                    {shop?.address && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[120px]">{shop.address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {shop?.rating ?? "N/A"}
                    </div>
                </div>

                {shop?.category && (
                    <span className="mt-2 inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {shop.category}
                    </span>
                )}

                <Link
                    href={`/shop/${shop.id}`}
                    className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition"
                >
                    Visit Shop
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};

export default ShopCard;
