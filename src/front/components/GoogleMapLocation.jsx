import React from 'react'
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export const GoogleMapLocation = () => {
    const center = {
        lat: 20.101060, // Latitud de Pachuca, Hidalgo
        lng: -98.759131 // Longitud de Pachuca, Hidalgo
    };
    return (
        <div>
            <div className="card shadow border-0 mx-auto" style={{ maxWidth: "800px" }}>
                <div className="card-body p-0" style={{ overflow: 'hidden', borderRadius: '0.5rem' }}>
                    <div className="ratio" style={{ aspectRatio: "4/3" }}>
                        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={center}
                                zoom={16}
                                options={{
                                    fullscreenControl: false,
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                }}
                            >
                                <Marker position={center} />
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            </div>
        </div>
    )
}
