"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
    const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (!storedData) return;

    const parsedData = JSON.parse(storedData);

    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    const isExpired = Date.now() - parsedData.timeStamp > expiryTime;

    return isExpired ? null : parsedData;
}

export const useLocationTracking = () => {
    const [location, setLocation] = useState<{ country: string, city: string } | null>(getStoredLocation());
 
    useEffect(() => {
        if (location) {
            return;
        };

        const getLocation = async () => {
            try {

                const res = await fetch("http://ip-api.com/json/")
                const data = await res.json();

                const newLocation = {
                    country: data?.country,
                    city: data?.city,
                    timeStamp: Date.now()
                }

                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
                setLocation(newLocation);
            } catch (error) {
                console.log("Failed to get Location", error)
            }
        }

        getLocation()
    }, [])

    return location;
}

