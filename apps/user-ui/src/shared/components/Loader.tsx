import React from "react";

const Loader = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
                <div
                    key={index}
                    className="p-4 bg-white shadow rounded-lg flex flex-col space-y-3 animate-pulse"
                >

                    <div className="h-40 bg-gray-300 rounded-md" />

                    <div className="h-4 bg-gray-300 rounded w-3/4" />

                    <div className="h-3 bg-gray-200 rounded w-1/2" />

                    <div className="h-8 bg-gray-300 rounded-md w-full" />
                </div>
            ))}
        </div>
    );
};

export default Loader;
