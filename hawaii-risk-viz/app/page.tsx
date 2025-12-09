"use client";

import { useState } from "react";
import MapArea from "./components/MapArea";
import CheckboxPanel, {
  LayerVisibility
} from "./components/CheckboxPanel";

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

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#e5e7eb"
      }}
    >
      <aside
        style={{
          width: "240px",
          padding: "12px",
          backgroundColor: "#f3f4f6",
          boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          boxSizing: "border-box"
        }}
      >
        <h1
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "8px"
          }}
        >
          Assessing Natural Disaster Risk in Hawaiʻi
        </h1>
        <CheckboxPanel layers={layers} onLayersChange={setLayers} />
      </aside>

      <section
        style={{
          flexGrow: 1,
          padding: "0",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <MapArea layers={layers} />
        </div>
      </section>
    </main>
  );
}
