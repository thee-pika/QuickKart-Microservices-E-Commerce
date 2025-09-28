import Image from "next/image";
import React from "react";

const Hero = () => {
    return (
        <section className="relative bg-gradient-to-r from-[#345635] to-[#060f06] text-white">
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between">

                <div className="text-center md:text-left space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        Welcome to <span className="text-yellow-400">Our Store</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
                        Discover amazing products, exclusive deals, and everything you need in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-2xl shadow hover:bg-yellow-300 transition">
                            Shop Now
                        </button>
                        <button className="px-6 py-3 bg-transparent border border-white font-semibold rounded-2xl hover:bg-white hover:text-indigo-700 transition">
                            Learn More
                        </button>
                    </div>
                </div>

                <div className="mt-10 md:mt-0">
                    <Image
                        src="/ear.png"
                        alt="Hero"
                        width={200}
                        height={200}
                        className="rounded-2xl shadow-lg"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
