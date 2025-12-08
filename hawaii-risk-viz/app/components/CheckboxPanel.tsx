// app/components/CheckboxPanel.tsx
"use client";

import { useState } from "react";
import AddLocation from "./AddLocation";

export type LayerVisibility = {
  policeStations: boolean;
  emergencySirens: boolean;
  hurricaneShelters: boolean;
  fireStations: boolean;
  fireRiskZones: boolean;
  lavaZones: boolean;
  tsunamiZones: boolean;
  rainfallContours: boolean;
  faultLines: boolean;
};

interface CheckboxPanelProps {
  layers: LayerVisibility;
  onLayersChange: (next: LayerVisibility) => void;
}

function CheckboxPanel({ layers, onLayersChange }: CheckboxPanelProps) {
  const [openWindow, setOpenWindow] = useState(false);

  function toggleLayer(key: keyof LayerVisibility) {
    onLayersChange({
      ...layers,
      [key]: !layers[key]
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      {/* Card 1: General Safety Infrastructure */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            General Safety Infrastructure
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={layers.policeStations}
              onChange={() => toggleLayer("policeStations")}
            />{" "}
            Police Stations
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.emergencySirens}
              onChange={() => toggleLayer("emergencySirens")}
            />{" "}
            Emergency Sirens
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.hurricaneShelters}
              onChange={() => toggleLayer("hurricaneShelters")}
            />{" "}
            Hurricane Shelters
          </label>
        </div>
      </section>

      {/* Card 2: Fire Disasters */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Fire Disasters
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={layers.fireStations}
              onChange={() => toggleLayer("fireStations")}
            />{" "}
            Fire Stations
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.fireRiskZones}
              onChange={() => toggleLayer("fireRiskZones")}
            />{" "}
            Fire Risk Zones
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.lavaZones}
              onChange={() => toggleLayer("lavaZones")}
            />{" "}
            Lava Flow Zones
          </label>
        </div>
      </section>

      {/* Card 3: Tsunami / Flooding */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Tsunami and Flooding Disasters
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={layers.tsunamiZones}
              onChange={() => toggleLayer("tsunamiZones")}
            />{" "}
            Tsunami Risk Zones
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.rainfallContours}
              onChange={() => toggleLayer("rainfallContours")}
            />{" "}
            Rainfall (mm)
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.faultLines}
              onChange={() => toggleLayer("faultLines")}
            />{" "}
            Earthquake Fault Lines
          </label>
        </div>
      </section>

      {/* Spacer pushes buttons to bottom */}
      <div style={{ flexGrow: 1 }} />

      {/* Bottom buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <button
          type="button"
          onClick={() => setOpenWindow(true)}
          style={{
            padding: "8px 10px",
            borderRadius: "16px",
            border: "1px solid #888",
            backgroundColor: "#3ac2a0ff",
            fontSize: "0.9rem",
            cursor: "pointer",
            alignSelf: "flex-start"
          }}
        >
          Add Location
        </button>

        {/* Update Map button removed */}

        <button
          type="button"
          style={{
            marginTop: "4px",
            padding: "8px 10px",
            borderRadius: "16px",
            border: "1px solid #5c7d7a",
            backgroundColor: "#523949ff",
            fontSize: "0.85rem",
            cursor: "pointer",
            textAlign: "center",
            color: "#ffffff"
          }}
        >
          Download Selected Data Sets
        </button>
      </div>

      <AddLocation open={openWindow} onClose={() => setOpenWindow(false)} />
    </div>
  );
}

export default CheckboxPanel;
