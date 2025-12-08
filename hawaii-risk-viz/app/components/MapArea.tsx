"use client";

import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import type { Data, Layout } from "plotly.js";
import Plot from "./PlotlyMap";
import type { LayerVisibility } from "./CheckboxPanel";

interface MapAreaProps {
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

// Very light GeoJSON typing to avoid `any`
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

function MapArea({ layers }: MapAreaProps) {
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
              decibel
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
              label: `${shelterName} (${island})`
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

  const data: Data[] = useMemo(() => {
    const traces: Data[] = [];

    // Anchor trace so Mapbox map always renders with our style
    traces.push({
      type: "scattermapbox",
      lat: [20.5],
      lon: [-156.5],
      marker: { size: 0.1, opacity: 0 },
      hoverinfo: "skip",
      showlegend: false,
      name: ""
    } as Data);

    // --- Polygon layers (go first so others draw on top) ---

    // Fire Risk Zones
    if (layers.fireRiskZones && fireRiskGeo) {
      const riskScale: Record<string, number> = {
        Low: 0,
        Medium: 1,
        High: 2
      };

      const features = fireRiskGeo.features;
      const locations = features.map(
        (f) => String(f.properties["objectid"] ?? "")
      );
      const z = features.map((f) => {
        const rating = f.properties["risk_rating"] as string | undefined;
        return rating ? riskScale[rating] ?? -1 : -1;
      });

      const fireRiskTrace = {
        type: "choroplethmapbox",
        geojson: fireRiskGeo,
        locations,
        featureidkey: "properties.objectid",
        z,
        text: features.map(
          (f) => (f.properties["risk_rating"] as string | undefined) ?? ""
        ),
        colorscale: [
          [0.0, "rgb(255,182,193)"],
          [0.33, "rgb(255,182,193)"],
          [0.33, "rgb(255,99,71)"],
          [0.66, "rgb(255,99,71)"],
          [0.66, "rgb(139,0,0)"],
          [1.0, "rgb(139,0,0)"]
        ],
        colorbar: {
          tickmode: "array",
          tickvals: [0, 1, 2],
          ticktext: ["Low", "Medium", "High"],
          title: { text: "Fire Risk Level" }
        },
        marker: { opacity: 0.5 },
        name: "Fire Risk Zones"
      } as unknown as Data;

      traces.push(fireRiskTrace);
    }

    // Tsunami Zones
    if (layers.tsunamiZones && tsunamiGeo) {
      const zoneTypeScale: Record<string, number> = {
        "Tsunami Safe Zone": 0,
        "Tsunami Evacuation Zone": 1,
        "Extreme Tsunami Evacuation Zone": 2
      };

      const features = tsunamiGeo.features;
      const locations = features.map(
        (f) => String(f.properties["objectid"] ?? "")
      );
      const z = features.map((f) => {
        const zoneType = f.properties["zone_type"] as string | undefined;
        return zoneType ? zoneTypeScale[zoneType] ?? -1 : -1;
      });

      const tsunamiTrace = {
        type: "choroplethmapbox",
        geojson: tsunamiGeo,
        locations,
        featureidkey: "properties.objectid",
        z,
        text: features.map(
          (f) => (f.properties["zone_type"] as string | undefined) ?? ""
        ),
        colorscale: [
          [0.0, "rgb(173,216,230)"],
          [0.33, "rgb(173,216,230)"],
          [0.33, "rgb(100,149,237)"],
          [0.66, "rgb(100,149,237)"],
          [0.66, "rgb(0,0,139)"],
          [1.0, "rgb(0,0,139)"]
        ],
        colorbar: {
          tickmode: "array",
          tickvals: [0, 1, 2],
          ticktext: ["Safe", "Evacuation", "Extreme"],
          title: { text: "Tsunami Zone" }
        },
        marker: { opacity: 0.5 },
        name: "Tsunami Zones"
      } as unknown as Data;

      traces.push(tsunamiTrace);
    }

    // Lava Flow Hazard Zones
    if (layers.lavaZones && lavaGeo) {
      const features = lavaGeo.features;
      const locations = features.map(
        (f) => String(f.properties["objectid"] ?? "")
      );
      const z = features.map((f) =>
        Number(f.properties["hzone"] ?? Number.NaN)
      );

      const lavaTrace = {
        type: "choroplethmapbox",
        geojson: lavaGeo,
        locations,
        featureidkey: "properties.objectid",
        z,
        colorscale: "Reds",
        colorbar: {
          title: { text: "Lava Hazard Zone" }
        },
        marker: { opacity: 0.5 },
        name: "Lava Flow Zones"
      } as unknown as Data;

      traces.push(lavaTrace);
    }

    // Rainfall contours (lines)
    if (layers.rainfallContours && rainfallGeo) {
      const bins = [
        { min: 0, max: 1000, color: "#c6dbef", label: "0–1000 mm" },
        { min: 1001, max: 2000, color: "#6baed6", label: "1001–2000 mm" },
        { min: 2001, max: 3000, color: "#4292c6", label: "2001–3000 mm" },
        { min: 3001, max: 4000, color: "#2171b5", label: "3001–4000 mm" },
        { min: 4001, max: Infinity, color: "#08306b", label: ">4000 mm" }
      ];

      bins.forEach((bin) => {
        const lons: (number | null)[] = [];
        const lats: (number | null)[] = [];
        const texts: string[] = [];

        rainfallGeo.features.forEach((f) => {
          const contour = Number(f.properties["contour"] ?? Number.NaN);
          if (Number.isNaN(contour)) return;

          if (contour >= bin.min && contour <= bin.max) {
            const coords = f.geometry.coordinates as [number, number][];
            coords.forEach(([lon, lat]) => {
              lons.push(lon);
              lats.push(lat);
              texts.push(`Rainfall: ${contour} mm`);
            });
            // separate line segments
            lons.push(null);
            lats.push(null);
            texts.push("");
          }
        });

        if (lons.length > 0) {
          const trace: Data = {
            type: "scattermapbox",
            mode: "lines",
            lon: lons,
            lat: lats,
            line: { width: 3, color: bin.color },
            hoverinfo: "text",
            text: texts,
            name: bin.label
          };
          traces.push(trace);
        }
      });
    }

    // Fault Lines (lines)
    if (layers.faultLines && faultsGeo) {
      const allLon: (number | null)[] = [];
      const allLat: (number | null)[] = [];

      faultsGeo.features.forEach((f) => {
        const coords = f.geometry.coordinates as [number, number][];
        coords.forEach(([lon, lat]) => {
          allLon.push(lon);
          allLat.push(lat);
        });
        allLon.push(null);
        allLat.push(null);
      });

      const faultTrace: Data = {
        type: "scattermapbox",
        mode: "lines",
        lon: allLon,
        lat: allLat,
        line: { width: 2, color: "blue" },
        name: "Fault Lines"
      };

      traces.push(faultTrace);
    }

    // --- Point layers last so they sit on top ---

    // Emergency Sirens
    if (layers.emergencySirens && sirens.length > 0) {
      const sirenTrace: Data = {
        type: "scattermapbox",
        mode: "markers",
        lon: sirens.map((s) => s.lon),
        lat: sirens.map((s) => s.lat),
        text: sirens.map((s) => s.label),
        marker: {
          size: 8,
          color: sirens.map((s) => s.decibel),
          colorscale: "Hot",
          reversescale: true,
          cmin: 100,
          cmax: 130,
          colorbar: {
            title: { text: "Decibel Level" }
          }
        },
        name: "Emergency Sirens"
      };
      traces.push(sirenTrace);
    }

    // Hurricane Shelters
    if (layers.hurricaneShelters && shelters.length > 0) {
      const shelterTrace: Data = {
        type: "scattermapbox",
        mode: "markers",
        lon: shelters.map((s) => s.lon),
        lat: shelters.map((s) => s.lat),
        text: shelters.map((s) => s.label),
        marker: {
          size: 10,
          color: "purple"
        },
        name: "Hurricane Shelters"
      };
      traces.push(shelterTrace);
    }

    return traces;
  }, [
    layers,
    sirens,
    shelters,
    fireRiskGeo,
    tsunamiGeo,
    lavaGeo,
    faultsGeo,
    rainfallGeo
  ]);

  const layout: Partial<Layout> = {
    mapbox: {
      style: "open-street-map", // or "carto-positron"
      center: { lat: 20.5, lon: -156.5 },
      zoom: 6
    },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "#cfe9f5", // light ocean blue
    plot_bgcolor: "#cfe9f5",
    showlegend: true
  };

  return (
    <Plot
      data={data}
      layout={layout}
      style={{ width: "100%", height: "100%" }}
      useResizeHandler
      config={{
        displayModeBar: true,
        displaylogo: false
      }}
    />
  );
}

export default MapArea;
