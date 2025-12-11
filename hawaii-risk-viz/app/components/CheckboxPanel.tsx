"use client";

import { useState, useEffect } from "react";
import AddLocation from "./AddLocation";
import SourcesModal, { type SourceLink } from "./SourcesModal";
import * as d3 from "d3";

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

type UserLocation = {
  id: string;
  lat: number;
  lon: number;
  radiusMiles: number;
};

type SimplePoint = {
  lat: number;
  lon: number;
};

interface CheckboxPanelProps {
  layers: LayerVisibility;
  onLayersChange: (next: LayerVisibility) => void;

  userLocations?: UserLocation[];
  onAddUserLocation?: (location: {
    lat: number;
    lon: number;
    radiusMiles: number;
  }) => void;
  onRemoveUserLocation?: (id: string) => void;
}

const LAYER_DATASETS: Record<keyof LayerVisibility, string[]> = {
  policeStations: [
    // "Police_Stations_(Statewide).csv"
  ],
  emergencySirens: ["Emergency-Sirens.csv"],
  hurricaneShelters: ["state-civil-defense-hurricane-shelters-csv.csv"],
  fireStations: [
    // "Fire_Stations_(Statewide).csv"
  ],
  fireRiskZones: ["Fire-Risk-Areas.geojson"],
  lavaZones: ["Volcano_Lava_Flow_Hazard_Zones.geojson"],
  tsunamiZones: ["Tsunami-Evacuation-All-Zones.geojson"],
  rainfallContours: ["Annual_Rainfall_(mm).geojson"],
  faultLines: ["Faults.geojson"]
};

type SourcesKey = "infrastructure" | "fire" | "tsunami";

const SECTION_SOURCES: Record<
  SourcesKey,
  { title: string; sources: SourceLink[] }
> = {
  infrastructure: {
    title: "General Safety Infrastructure - data sources",
    sources: [
      {
        label: "Emergency Siren Locations (Hawaii Open Data resource)",
        url: "https://opendata.hawaii.gov/dataset/department-of-defense-state-civil-defense-emergency-siren-locations/resource/8241acde-528f-4895-84c9-aa21dc3bdc94"
      },
      {
        label: "State Civil Defense Hurricane Shelters (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/state-civil-defense-hurricane-shelters"
      },
      {
        label: "Police Stations (HI Geodata ArcGIS)",
        url: "https://geodata.hawaii.gov/arcgis/rest/services/EmergMgmtPubSafety/MapServer/5/query?where=1=1&outFields=*&outSR=4326&f=geojson"
      }
    ]
  },

  fire: {
    title: "Fire Disasters - data sources",
    sources: [
      {
        label: "Fire Risk Areas (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/fire-risk-areas"
      },
      {
        label: "Volcano Lava Flow Hazard Zones (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/volcano-lava-flow-hazard-zones"
      },
      {
        label: "Fire Stations (HI GeoData ArcGIS)",
        url: "https://geodata.hawaii.gov/arcgis/rest/services/EmergMgmtPubSafety/MapServer/4/query?where=1=1&outFields=*&outSR=4326&f=geojson"
      },
    ]
  },

  tsunami: {
    title: "Tsunami & Flooding Disasters - data sources",
    sources: [
      {
        label: "Tsunami Evacuation All Zones (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/tsunami-evacuation-all-zones"
      },
      {
        label: "Annual Rainfall (mm) (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/annual-rainfall-mm"
      },
      {
        label: "Tsunami Safe Zones (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/tsunami-safe-zones"
      },
      {
        label: "Earthquake Fault Lines (Hawaii Open Data)",
        url: "https://opendata.hawaii.gov/dataset/faults"
      }
    ]
  }
};

// Haversine distance in meters between two lat/lon points
function distanceMeters(a: SimplePoint, b: SimplePoint): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function countPointsWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusMeters: number,
  points: SimplePoint[]
): number {
  const center: SimplePoint = { lat: centerLat, lon: centerLon };
  let count = 0;

  for (const p of points) {
    const d = distanceMeters(center, p);
    if (d <= radiusMeters) count += 1;
  }

  return count;
}

async function downloadSelectedDatasets(layers: LayerVisibility) {
  // Lazy-load so it only runs in the browser
  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;
  const zip = new JSZip();

  const filesToDownload: { url: string; name: string }[] = [];

  (Object.entries(LAYER_DATASETS) as [keyof LayerVisibility, string[]][]).forEach(
    ([layerKey, files]) => {
      if (!layers[layerKey]) return;
      files.forEach((filename) => {
        filesToDownload.push({
          url: `/datasets/${filename}`,
          name: filename
        });
      });
    }
  );

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

function CheckboxPanel({
  layers,
  onLayersChange,

  userLocations = [],
  onAddUserLocation,
  onRemoveUserLocation
}: CheckboxPanelProps) {
  const [openWindow, setOpenWindow] = useState(false);
  const [openSources, setOpenSources] = useState<SourcesKey | null>(null);

  // Points for quick distance checks
  const [sirenPoints, setSirenPoints] = useState<SimplePoint[]>([]);
  const [shelterPoints, setShelterPoints] = useState<SimplePoint[]>([]);
  const [fireStationPoints, setFireStationPoints] = useState<SimplePoint[]>([]);
  const [policeStationPoints, setPoliceStationPoints] = useState<SimplePoint[]>(
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPoints() {
      try {
        // Sirens (CSV)
        const sirenRows: d3.DSVRowArray<string> = await d3.csv(
          "/datasets/Emergency-Sirens.csv"
        );
        if (!cancelled) {
          const parsed: SimplePoint[] = sirenRows
            .map((row) => {
              const loc1 = row["Location 1"] ?? "";
              const match = loc1.match(/\(([^,]+),\s*([^)]+)\)/);
              if (!match) return null;
              const lat = Number(match[1]);
              const lon = Number(match[2]);
              if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
              return { lat, lon };
            })
            .filter((p): p is SimplePoint => p !== null);
          setSirenPoints(parsed);
        }

        // Shelters (CSV)
        const shelterRows: d3.DSVRowArray<string> = await d3.csv(
          "/datasets/state-civil-defense-hurricane-shelters-csv.csv"
        );
        if (!cancelled) {
          const parsedShelters: SimplePoint[] = shelterRows
            .map((row) => {
              const loc = row.Location ?? "";
              const match = loc.match(/\(([-0-9.]+),\s*([-0-9.]+)\)/);
              if (!match) return null;
              const lat = Number(match[1]);
              const lon = Number(match[2]);
              if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
              return { lat, lon };
            })
            .filter((p): p is SimplePoint => p !== null);
          setShelterPoints(parsedShelters);
        }

        // Fire stations (GeoJSON)
        const fireJson: any = await d3.json(
          "/datasets/hawaii_fire_stations.geojson"
        );
        if (!cancelled && fireJson?.features) {
          const pts: SimplePoint[] = fireJson.features
            .map((f: any) => {
              if (!f.geometry || f.geometry.type !== "Point") return null;
              const [lon, lat] = f.geometry.coordinates as [number, number];
              if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
              return { lat, lon };
            })
            .filter((p: SimplePoint | null): p is SimplePoint => p !== null);
          setFireStationPoints(pts);
        }

        // Police stations (GeoJSON)
        const policeJson: any = await d3.json(
          "/datasets/hawaii_police_stations.geojson"
        );
        if (!cancelled && policeJson?.features) {
          const pts: SimplePoint[] = policeJson.features
            .map((f: any) => {
              if (!f.geometry || f.geometry.type !== "Point") return null;
              const [lon, lat] = f.geometry.coordinates as [number, number];
              if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
              return { lat, lon };
            })
            .filter((p: SimplePoint | null): p is SimplePoint => p !== null);
          setPoliceStationPoints(pts);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading point datasets for panel", error);
      }
    }

    void loadPoints();
    return () => {
      cancelled = true;
    };
  }, []);

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

          <button
            type="button"
            onClick={() => setOpenSources("infrastructure")}
            title="View data sources"
            aria-label="View data sources for General Safety Infrastructure"
            style={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              border: "1px solid #777",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: "20px"
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
            onClick={() => setOpenSources("fire")}
            title="View data sources"
            aria-label="View data sources for Fire Disasters"
            style={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              border: "1px solid #777",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: "20px"
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
            onClick={() => setOpenSources("tsunami")}
            title="View data sources"
            aria-label="View data sources for Tsunami and Flooding Disasters"
            style={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              border: "1px solid #777",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: "20px"
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

      {/* Card 4: My Custom Locations */}
      {userLocations.length > 0 && (
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
              My Custom Locations
            </span>
          </header>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "0.85rem"
            }}
          >
            {userLocations.map((loc) => {
              const radiusMeters = loc.radiusMiles * 1609.34;

              const nearbyFire = countPointsWithinRadius(
                loc.lat,
                loc.lon,
                radiusMeters,
                fireStationPoints
              );
              const nearbyPolice = countPointsWithinRadius(
                loc.lat,
                loc.lon,
                radiusMeters,
                policeStationPoints
              );
              const nearbyShelters = countPointsWithinRadius(
                loc.lat,
                loc.lon,
                radiusMeters,
                shelterPoints
              );
              const nearbySirens = countPointsWithinRadius(
                loc.lat,
                loc.lon,
                radiusMeters,
                sirenPoints
              );

              return (
                <li
                  key={loc.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>
                      Lat {loc.lat.toFixed(4)}, Lon {loc.lon.toFixed(4)} ·{" "}
                      {loc.radiusMiles} mi radius
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveUserLocation?.(loc.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: "1px solid #b91c1c",
                        backgroundColor: "#fee2e2",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#374151"
                    }}
                  >
                    {nearbyFire} fire stations, {nearbyPolice} police stations,{" "}
                    {nearbyShelters} shelters, {nearbySirens} sirens in radius
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
            border: "1px solid",
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
            border: "1px solid ",
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

      <SourcesModal
        open={openSources !== null}
        title={openSources ? SECTION_SOURCES[openSources].title : ""}
        sources={openSources ? SECTION_SOURCES[openSources].sources : []}
        onClose={() => setOpenSources(null)}
      />
      
      <AddLocation
        open={openWindow}
        onClose={() => setOpenWindow(false)}
        onSave={(loc) => {
          onAddUserLocation?.(loc);
          setOpenWindow(false);
        }}
      />
    </div>
  );
}

export default CheckboxPanel;
