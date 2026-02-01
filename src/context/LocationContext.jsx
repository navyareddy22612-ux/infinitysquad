import React, { createContext, useState, useContext } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    // Default to Punjab, India (roughly) or a generic welcome location
    const [location, setLocation] = useState({
        name: "Punjab, India",
        lat: 31.1471,
        lng: 75.3412
    });
    const [loading, setLoading] = useState(false);

    const updateLocation = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            // Extract a meaningful name (city, state, or county)
            const address = data.address;
            const city = address.city || address.town || address.village || address.county;
            const state = address.state;
            const country = address.country;

            const locationName = city ? `${city}, ${state}` : `${state}, ${country}`;

            setLocation({
                name: locationName,
                lat: lat,
                lng: lng
            });
        } catch (error) {
            console.error("Error fetching location name:", error);
            // Fallback to coordinates if name fetch fails
            setLocation({
                name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
                lat: lat,
                lng: lng
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{ location, updateLocation, loading }}>
            {children}
        </LocationContext.Provider>
    );
};
