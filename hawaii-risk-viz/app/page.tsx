"use client";

import { useState } from "react";
import MapArea from "./components/MapArea";
import CheckboxPanel, { LayerVisibility } from "./components/CheckboxPanel";
import AboutPage from "./about";

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
  const [aboutOpen, setAboutOpen] = useState(false);

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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "black"
            }}
          >
            Risk in Hawaiʻi
          </h1>

          <button
            onClick={() => setAboutOpen(true)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: "#3b1515",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            About
          </button>
        </div>

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
      <AboutPage open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
