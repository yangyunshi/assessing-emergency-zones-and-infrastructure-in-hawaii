// app/components/LeafletMap.tsx
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import type { PathOptions } from "leaflet";
import * as d3 from "d3";
import type { LayerVisibility } from "./CheckboxPanel";

interface LeafletMapProps {
  layers: LayerVisibility;
}

interface SirenPoint {
  lat: number;
  lon: number;
  label: string;
  decibel: number;
}

interface ShelterPoint {
  lat: number;
  lon: number;
  label: string;
}

// Very light GeoJSON typing
interface GeoFeature {
  type: "Feature";
  properties: {
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

function LeafletMap({ layers }: LeafletMapProps) {
  const [sirens, setSirens] = useState<SirenPoint[]>([]);
  const [shelters, setShelters] = useState<ShelterPoint[]>([]);
  const [fireRiskGeo, setFireRiskGeo] = useState<FeatureCollection | null>(null);
  const [tsunamiGeo, setTsunamiGeo] = useState<FeatureCollection | null>(null);
  const [lavaGeo, setLavaGeo] = useState<FeatureCollection | null>(null);
  const [faultsGeo, setFaultsGeo] = useState<FeatureCollection | null>(null);
  const [rainfallGeo, setRainfallGeo] = useState<FeatureCollection | null>(null);

  // Load datasets once
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const sirenRows: d3.DSVRowArray<string> = await d3.csv(
          "/datasets/Emergency-Sirens.csv"
        );
        const shelterRows: d3.DSVRowArray<string> = await d3.csv(
          "/datasets/state-civil-defense-hurricane-shelters-csv.csv"
        );

        const fireRiskJson = (await d3.json(
          "/datasets/Fire-Risk-Areas.geojson"
        )) as FeatureCollection;
        const tsunamiJson = (await d3.json(
          "/datasets/Tsunami-Evacuation-All-Zones.geojson"
        )) as FeatureCollection;
        const lavaJson = (await d3.json(
          "/datasets/Volcano_Lava_Flow_Hazard_Zones.geojson"
        )) as FeatureCollection;
        const faultsJson = (await d3.json(
          "/datasets/Faults.geojson"
        )) as FeatureCollection;
        const rainfallJson = (await d3.json(
          "/datasets/Annual_Rainfall_(mm).geojson"
        )) as FeatureCollection;

        if (cancelled) return;

        // ----- Emergency Sirens -----
        const parsedSirens: SirenPoint[] = sirenRows
          .map((row) => {
            const loc1 = row["Location 1"] ?? "";
            const location = row.LOCATION ?? "";
            const decibelStr = row.DECIBEL ?? "";

            const match = loc1.match(/\(([^,]+),\s*([^)]+)\)/);
            if (!match) return null;

            const lat = Number(match[1]);
            const lon = Number(match[2]);
            const decibel = Number(decibelStr);

            if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

            return {
              lat,
              lon,
              label: `${location} (${decibelStr} dB)`,
              decibel,
            };
          })
          .filter((siren): siren is SirenPoint => siren !== null);

        setSirens(parsedSirens);

        // ----- Hurricane Shelters -----
        const parsedShelters: ShelterPoint[] = shelterRows
          .map((row) => {
            const loc = row.Location ?? "";
            const match = loc.match(/\(([-0-9.]+),\s*([-0-9.]+)\)/);
            const lat = match ? Number(match[1]) : NaN;
            const lon = match ? Number(match[2]) : NaN;

            if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

            const shelterName = row["Hurricane Shelter"] ?? "Shelter";
            const island = row.Island ?? "";
            return {
              lat,
              lon,
              label: `${shelterName} (${island})`,
            };
          })
          .filter((shelter): shelter is ShelterPoint => shelter !== null);

        setShelters(parsedShelters);

        setFireRiskGeo(fireRiskJson);
        setTsunamiGeo(tsunamiJson);
        setLavaGeo(lavaJson);
        setFaultsGeo(faultsJson);
        setRainfallGeo(rainfallJson);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading map datasets", error);
      }
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Styling helpers for polygons/lines ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fireRiskStyle = (feature: any): PathOptions => {
    const rating = feature?.properties?.risk_rating as string | undefined;
    let fillColor = "#ffb6c1"; // Low
    if (rating === "Medium") fillColor = "#ff6347";
    if (rating === "High") fillColor = "#8b0000";

    return {
      color: fillColor,
      weight: 0.5,
      fillColor,
      fillOpacity: 0.5,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tsunamiStyle = (feature: any): PathOptions => {
    const zone = feature?.properties?.zone_type as string | undefined;
    let fillColor = "#add8e6";
    if (zone === "Tsunami Evacuation Zone") fillColor = "#6495ed";
    if (zone === "Extreme Tsunami Evacuation Zone") fillColor = "#00008b";
    return {
      color: fillColor,
      weight: 0.5,
      fillColor,
      fillOpacity: 0.5,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lavaStyle = (feature: any): PathOptions => {
    const zone = Number(feature?.properties?.hzone ?? Number.NaN);
    let fillColor = "#fee5d9";
    if (!Number.isNaN(zone)) {
      if (zone <= 2) fillColor = "#a50f15";
      else if (zone <= 4) fillColor = "#fb6a4a";
      else fillColor = "#fcae91";
    }
    return {
      color: fillColor,
      weight: 0.5,
      fillColor,
      fillOpacity: 0.5,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rainfallStyle = (feature: any): PathOptions => {
    const contour = Number(feature?.properties?.contour ?? Number.NaN);
    let color = "#c6dbef";
    if (!Number.isNaN(contour)) {
      if (contour <= 1000) color = "#c6dbef";
      else if (contour <= 2000) color = "#6baed6";
      else if (contour <= 3000) color = "#4292c6";
      else if (contour <= 4000) color = "#2171b5";
      else color = "#08306b";
    }
    return {
      color,
      weight: 2,
    };
  };

  const faultsStyle = (): PathOptions => ({
    color: "blue",
    weight: 2,
  });

  return (
    <MapContainer
      center={[20.5, -156.5]}
      zoom={6}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Polygon / line layers */}
      {layers.fireRiskZones && fireRiskGeo && (
        <GeoJSON data={fireRiskGeo as any} style={fireRiskStyle} />
      )}

      {layers.tsunamiZones && tsunamiGeo && (
        <GeoJSON data={tsunamiGeo as any} style={tsunamiStyle} />
      )}

      {layers.lavaZones && lavaGeo && (
        <GeoJSON data={lavaGeo as any} style={lavaStyle} />
      )}

      {layers.rainfallContours && rainfallGeo && (
        <GeoJSON data={rainfallGeo as any} style={rainfallStyle} />
      )}

      {layers.faultLines && faultsGeo && (
        <GeoJSON data={faultsGeo as any} style={faultsStyle} />
      )}

      {/* Point layers */}
      {layers.emergencySirens &&
        sirens.map((s, i) => (
          <CircleMarker
            key={`siren-${i}`}
            center={[s.lat, s.lon]}
            radius={4}
            pathOptions={{ color: "#555", fillColor: "#555", fillOpacity: 0.9 }}
          >
            <Popup>{s.label}</Popup>
          </CircleMarker>
        ))}

      {layers.hurricaneShelters &&
        shelters.map((s, i) => (
          <CircleMarker
            key={`shelter-${i}`}
            center={[s.lat, s.lon]}
            radius={4}
            pathOptions={{
              color: "purple",
              fillColor: "purple",
              fillOpacity: 0.9,
            }}
          >
            <Popup>{s.label}</Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

export default LeafletMap;
