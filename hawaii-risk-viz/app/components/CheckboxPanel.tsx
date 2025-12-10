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

const LAYER_DATASETS: Record<keyof LayerVisibility, string[]> = {
  policeStations: ["hawaii_police_stations.geojson"],
  emergencySirens: ["Emergency-Sirens.csv"],
  hurricaneShelters: ["state-civil-defense-hurricane-shelters-csv.csv"],
  fireStations: ["hawaii_fire_stations.geojson"],
  fireRiskZones: ["Fire-Risk-Areas.geojson"],
  lavaZones: ["Volcano_Lava_Flow_Hazard_Zones.geojson"],
  tsunamiZones: ["Tsunami-Evacuation-All-Zones.geojson"],
  rainfallContours: ["Annual_Rainfall_(mm).geojson"],
  faultLines: ["Faults.geojson"],
};


async function downloadSelectedDatasets(layers: LayerVisibility) {
  // Lazy-load so it only runs in the browser
  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;
  const zip = new JSZip();

  const filesToDownload: { url: string; name: string }[] = [];

  (Object.entries(LAYER_DATASETS) as [keyof LayerVisibility, string[]][])
    .forEach(([layerKey, files]) => {
      if (!layers[layerKey]) return;
      files.forEach((filename) => {
        filesToDownload.push({
          url: `/datasets/${filename}`,
          name: filename
        });
      });
    });

  if (filesToDownload.length === 0) {
    window.alert("No datasets selected. Please check at least one layer.");
    return;
  }

  for (const file of filesToDownload) {
    try {
      const res = await fetch(file.url);
      if (!res.ok) {
        // Skip missing files but don’t crash
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch dataset:", file.url);
        continue;
      }
      const blob = await res.blob();
      zip.file(file.name, blob);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching dataset:", file.url, err);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "hawaii-datasets.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


function CheckboxPanel({ layers, onLayersChange }: CheckboxPanelProps) {
  const [openWindow, setOpenWindow] = useState(false);

  function toggleLayer(key: keyof LayerVisibility) {
    onLayersChange({
      ...layers,
      [key]: !layers[key]
    });
  }

  async function handleDownloadClick() {
    await downloadSelectedDatasets(layers);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "black",
        paddingBottom: "12px",
        boxSizing: "border-box"
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

        <button
          type="button"
          onClick={handleDownloadClick}
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
