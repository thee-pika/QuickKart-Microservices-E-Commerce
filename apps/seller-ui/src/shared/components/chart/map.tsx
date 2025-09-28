"use client"

import { useState } from "react"
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps"

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const locations = [
    { name: "New York", coordinates: [-74.006, 40.7128] },
    { name: "London", coordinates: [-0.1276, 51.5072] },
    { name: "Tokyo", coordinates: [139.6917, 35.6895] },
    { name: "Sydney", coordinates: [151.2093, -33.8688] },
    { name: "Bengaluru", coordinates: [77.5946, 12.9716] },
]

export default function WorldMap() {
    const [hovered, setHovered] = useState<string | null>(null)

    return (
        <div className="bg-gradient-to-br from-black via-purple-950 to-black p-6 rounded-2xl shadow-lg border border-purple-800/40">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
                🌍 Global Spread
            </h2>

            <ComposableMap
                projectionConfig={{ scale: 150 }}
                width={800}
                height={400}
                style={{ width: "100%", height: "auto" }}
            >

                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#1f1f1f"
                                stroke="#4B5563"
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#7C3AED", outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>


                {locations.map(({ name, coordinates }) => (
                    <Marker
                        key={name}
                        coordinates={coordinates as [number, number]}
                        onMouseEnter={() => setHovered(name)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <circle
                            r={6}
                            className="fill-purple-500 stroke-white stroke-[2px] animate-ping"
                        />


                        {hovered === name && (
                            <g transform="translate(10, -20)">
                                <rect
                                    width={90}
                                    height={26}
                                    rx={6}
                                    className="fill-black/90 stroke-purple-500 shadow-md"
                                />
                                <text
                                    x={45}
                                    y={17}
                                    textAnchor="middle"
                                    className="text-xs fill-purple-200 font-medium"
                                >
                                    {name}
                                </text>
                            </g>
                        )}
                    </Marker>
                ))}
            </ComposableMap>
        </div>
    )
}
