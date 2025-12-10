"use client";

import { useState } from "react";
import MapArea from "./components/MapArea";
import CheckboxPanel, { LayerVisibility } from "./components/CheckboxPanel";

type UserLocation = {
  id: string;
  lat: number;
  lon: number;
  radiusMiles: number;
};

const initialLayers: LayerVisibility = {
  policeStations: false,
  emergencySirens: true,
  hurricaneShelters: false,
  fireStations: false,
  fireRiskZones: false,
  lavaZones: false,
  tsunamiZones: false,
  rainfallContours: false,
  faultLines: false
};

export default function HomePage() {
  const [layers, setLayers] = useState<LayerVisibility>(initialLayers);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);

  function handleAddUserLocation(loc: {
    lat: number;
    lon: number;
    radiusMiles: number;
  }) {
    setUserLocations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...loc
      }
    ]);
  }

  function handleRemoveUserLocation(id: string) {
    setUserLocations((prev) => prev.filter((loc) => loc.id !== id));
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "100vh"
      }}
    >
      <section
        style={{
          padding: "12px",
          backgroundColor: "#f3f4f6",
          overflowY: "auto"
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "12px",
            fontSize: "1.1rem",
            fontWeight: 700
          }}
        >
          Risk in Hawaiʻi
        </h1>

        <CheckboxPanel
          layers={layers}
          onLayersChange={setLayers}
          userLocations={userLocations}
          onAddUserLocation={handleAddUserLocation}
          onRemoveUserLocation={handleRemoveUserLocation}
        />
      </section>

      <section
        style={{
          position: "relative"
        }}
      >
        <MapArea layers={layers} userLocations={userLocations} />
      </section>
    </main>
  );
}
