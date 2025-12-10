"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  GeoJSON,
  Marker,
  useMapEvents,
  Circle
} from "react-leaflet";

import L, { PathOptions, DivIcon } from "leaflet";
import * as d3 from "d3";
import type { LayerVisibility } from "./CheckboxPanel";



type UserLocation = {
  id: string;
  lat: number;
  lon: number;
  radiusMiles: number;
};

interface LeafletMapProps {
  layers: LayerVisibility;
  userLocations?: UserLocation[];
}

// --- SVGs for each icon type ---
const POLICE_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <rect x="4" y="14" width="16" height="3" rx="1.5" fill="#1d4ed8" />
    <polygon points="6,9 12,6 18,9 16,14 8,14" fill="#1d4ed8" />
  </svg>
`;

const SIREN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- Speaker body -->
    <rect x="7" y="8" width="4" height="8" rx="1" fill="#6b7280" />
    <!-- Speaker cone -->
    <polygon points="11,9 15,11 15,13 11,15" fill="#6b7280" />
    <!-- Sound waves -->
    <path d="M16 10.5 Q17.5 12 16 13.5" fill="none" stroke="#6b7280" stroke-width="1.3" />
  </svg>
`;

const SHELTER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <polygon points="4,11 12,4 20,11 20,20 4,20" fill="#16a34a" />
  </svg>
`;

const FIRE_STATION_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 3 L15 4.5 L18 4 V11 C18 14.5 15.8 17 12 19 8.2 17 6 14.5 6 11 V4 L9 4.5 Z" fill="#ea580c" />
  </svg>
`;

const USER_LOCATION_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cx="12" cy="10" r="4" fill="#0f766e" />
    <path d="M12 14 L9 20 L15 20 Z" fill="#0f766e" />
  </svg>
`;

// --- Small helper to build SVG-based Leaflet icons ---
function createSvgIcon(svg: string, size = 28): DivIcon {
  const s = size;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [s, s],
    iconAnchor: [s / 2, (s * 6) / 7],
    popupAnchor: [0, -s / 2]
  });
}

// Icon size based on zoom
function getIconSize(zoom: number): number {
  if (zoom < 6) return 12;
  if (zoom < 8) return 18;
  if (zoom < 10) return 24;
  return 30;
}

interface ZoomWatcherProps {
  onZoomChange: (z: number) => void;
}

function ZoomWatcher({ onZoomChange }: ZoomWatcherProps) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
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

interface SimplePoint {
  lat: number;
  lon: number;
}

function countPointsWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusMeters: number,
  points: SimplePoint[]
): number {
  const center = L.latLng(centerLat, centerLon);
  let count = 0;

  for (const p of points) {
    const d = center.distanceTo(L.latLng(p.lat, p.lon));
    if (d <= radiusMeters) count += 1;
  }

  return count;
}


function LeafletMap({ layers, userLocations = [] }: LeafletMapProps) {

  const [sirens, setSirens] = useState<SirenPoint[]>([]);
  const [shelters, setShelters] = useState<ShelterPoint[]>([]);
  const [fireRiskGeo, setFireRiskGeo] = useState<FeatureCollection | null>(null);
  const [tsunamiGeo, setTsunamiGeo] = useState<FeatureCollection | null>(null);
  const [lavaGeo, setLavaGeo] = useState<FeatureCollection | null>(null);
  const [faultsGeo, setFaultsGeo] = useState<FeatureCollection | null>(null);
  const [rainfallGeo, setRainfallGeo] = useState<FeatureCollection | null>(null);
  const [fireStationsGeo, setFireStationsGeo] = useState<FeatureCollection | null>(
    null
  );
  const [policeStationsGeo, setPoliceStationsGeo] =
    useState<FeatureCollection | null>(null);
  const [selectedFireRisk, setSelectedFireRisk] = useState<string | null>(null);
  const [hoverFireRisk, setHoverFireRisk] = useState<string | null>(null);
  const [selectedTsunamiType, setSelectedTsunamiType] = useState<string | null>(null);
  const [hoverTsunamiType, setHoverTsunamiType] = useState<string | null>(null);
  const [selectedLavaZone, setSelectedLavaZone] = useState<number | null>(null);
  const [hoverLavaZone, setHoverLavaZone] = useState<number | null>(null);


  const fireStationPoints = useMemo<SimplePoint[]>(() => {
    if (!fireStationsGeo) return [];
    return fireStationsGeo.features
      .map((f) => {
        if (!f.geometry || f.geometry.type !== "Point") return null;
        const coords = f.geometry.coordinates as [number, number]; // [lon, lat]
        return { lat: coords[1], lon: coords[0] };
      })
      .filter((p): p is SimplePoint => p !== null);
  }, [fireStationsGeo]);

  const policeStationPoints = useMemo<SimplePoint[]>(() => {
    if (!policeStationsGeo) return [];
    return policeStationsGeo.features
      .map((f) => {
        if (!f.geometry || f.geometry.type !== "Point") return null;
        const coords = f.geometry.coordinates as [number, number]; // [lon, lat]
        return { lat: coords[1], lon: coords[0] };
      })
      .filter((p): p is SimplePoint => p !== null);
  }, [policeStationsGeo]);


  const [zoom, setZoom] = useState(6);

  // Zoom-dependent icons for all layers
  const policeIcon = useMemo(
    () => createSvgIcon(POLICE_SVG, getIconSize(zoom)),
    [zoom]
  );

  const sirenIcon = useMemo(
    () => createSvgIcon(SIREN_SVG, getIconSize(zoom)),
    [zoom]
  );

  const shelterIcon = useMemo(
    () => createSvgIcon(SHELTER_SVG, getIconSize(zoom)),
    [zoom]
  );

  const fireStationIcon = useMemo(
    () => createSvgIcon(FIRE_STATION_SVG, getIconSize(zoom)),
    [zoom]
  );

  const userLocationIcon = useMemo(
    () => createSvgIcon(USER_LOCATION_SVG, getIconSize(zoom)),
    [zoom]
  );

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

        const fireStationsJson = (await d3.json(
          "/datasets/hawaii_fire_stations.geojson"
        )) as FeatureCollection;
        const policeStationsJson = (await d3.json(
          "/datasets/hawaii_police_stations.geojson"
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
        setFireStationsGeo(fireStationsJson);
        setPoliceStationsGeo(policeStationsJson);
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

    const isSelected = selectedFireRisk === rating;
    const isHovered = hoverFireRisk === rating;

    return {
      color: fillColor,
      fillColor,
      weight: isSelected ? 2 : 0.5,
      fillOpacity: isSelected || isHovered ? 0.8 : 0.4,
      opacity: isSelected || isHovered ? 1 : 0.5,
    };
  };


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tsunamiStyle = (feature: any): PathOptions => {
    const zone = feature?.properties?.zone_type as string | undefined;

    let fillColor = "#add8e6"; // Default
    if (zone === "Tsunami Evacuation Zone") fillColor = "#6495ed";
    if (zone === "Extreme Tsunami Evacuation Zone") fillColor = "#00008b";

    const isSelected = selectedTsunamiType && selectedTsunamiType === zone;
    const isHovered = hoverTsunamiType && hoverTsunamiType === zone;

    return {
      color: fillColor,
      fillColor,
      weight: isSelected ? 3 : 0.7,
      fillOpacity: isSelected || isHovered ? 0.8 : 0.4,
      opacity: isSelected || isHovered ? 1 : 0.6,
    };
  };

// Sequential scale for lava hazard (1 = high risk, 9 = low risk)
  const lavaColorScale = d3.scaleSequential()
    .domain([9, 1])            // invert domain: 1 = darkest, 9 = lightest
    .interpolator(d3.interpolateReds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lavaStyle = (feature: any): PathOptions => {
    const zone = Number(feature?.properties?.hzone ?? NaN);
    if (Number.isNaN(zone)) return { color: "#fcae91", weight: 0.5, fillOpacity: 0.5 };

    const fillColor = lavaColorScale(zone);

    const isSelected = selectedLavaZone === zone;
    const isHovered = hoverLavaZone === zone;

    return {
      color: fillColor,
      fillColor,
      weight: isSelected ? (isHovered ? 4 : 3) : (isHovered ? 3 : 0.5),
      fillOpacity: isSelected || isHovered ? 0.8 : 0.5,
      opacity: isSelected || isHovered ? 1 : 0.5,
    };
  };




  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rainfallStyle = (feature: any): PathOptions => { const contour = Number(feature?.properties?.contour ?? Number.NaN);
    let color = "#c6dbef";
    if (!Number.isNaN(contour))
    { if (contour <= 1000) color = "#c6dbef";
      else if (contour <= 2000) color = "#6baed6";
      else if (contour <= 3000) color = "#4292c6";
      else if (contour <= 4000) color = "#2171b5";
      else color = "#08306b"; }
    return { color, weight: 2 }; };





  const faultsStyle = (): PathOptions => ({
    color: "green",
    weight: 4
  });

  return (
    <MapContainer
      center={[20.5, -156.5]}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomWatcher onZoomChange={setZoom} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Polygon / line layers */}

      {layers.fireRiskZones && fireRiskGeo && (
        <GeoJSON
          data={fireRiskGeo as any}
          style={fireRiskStyle} // style function uses selectedHover + hoverHover state
          onEachFeature={(feature: any, layer: L.Layer) => {
            const pathLayer = layer as L.Path;
            const rating = feature?.properties?.risk_rating;

            // Tooltip (sticky: false avoids jitter)
            pathLayer.bindTooltip(`Fire Risk: ${rating}`, { sticky: false });

            pathLayer.on({
              click: () => setSelectedFireRisk(prev => (prev === rating ? null : rating)),
              mouseover: () => setHoverFireRisk(rating),
              mouseout: () => setHoverFireRisk(null),
            });
          }}
        />
      )}





      {layers.tsunamiZones && tsunamiGeo && (
        <GeoJSON
          data={tsunamiGeo as any}
          style={tsunamiStyle}
          onEachFeature={(feature: any, layer: L.Layer) => {
            const pathLayer = layer as L.Path;
            const zone = feature?.properties?.zone_type;

            pathLayer.on({
              click: () => setSelectedTsunamiType(prev => (prev === zone ? null : zone)),
              mouseover: () => {
                setHoverTsunamiType(zone);
                pathLayer.setStyle({ weight: 3, fillOpacity: 0.8 });
              },
              mouseout: () => {
                setHoverTsunamiType(null);
                const isSelected = selectedTsunamiType === zone;
                pathLayer.setStyle({
                  weight: isSelected ? 3 : 0.7,
                  fillOpacity: isSelected || hoverTsunamiType === zone ? 0.8 : 0.4,
                });
              },
            });

            pathLayer.bindTooltip(`Tsunami Zone: ${zone}`, { sticky: true });
          }}
        />
      )}


      {layers.lavaZones && lavaGeo && (
        <GeoJSON
          data={lavaGeo as any}
          style={lavaStyle}
          onEachFeature={(feature: any, layer: L.Layer) => {
            const pathLayer = layer as L.Path;
            const hzone = Number(feature?.properties?.hzone ?? NaN);

            pathLayer.on({
              click: () => setSelectedLavaZone(prev => (prev === hzone ? null : hzone)),
              mouseover: () => {
                setHoverLavaZone(hzone);
                pathLayer.setStyle({ weight: 3, fillOpacity: 0.8 });
                pathLayer.bindTooltip(`Lava Zone Rank: ${hzone}`, { sticky: true }).openTooltip();
              },
              mouseout: () => {
                setHoverLavaZone(null);
                const isSelected = selectedLavaZone === hzone;
                pathLayer.setStyle({
                  weight: isSelected ? 3 : 0.5,
                  fillOpacity: isSelected || hoverLavaZone === hzone ? 0.8 : 0.5,
                });
                pathLayer.closeTooltip();
              },
            });
          }}
        />
      )}


      {layers.rainfallContours && rainfallGeo && (
        <GeoJSON
          data={rainfallGeo as any}
          style={rainfallStyle}
          onEachFeature={(feature: any, layer) => {
            const contour = Number(feature?.properties?.contour ?? Number.NaN);

            layer.bindTooltip(`Rainfall: ${contour} mm`, {
              sticky: true,
              direction: "top"
            });

            layer.on({
              mouseover: () => {
                setHoverRainContour(contour);
                (layer as L.Path).setStyle({ weight: 5 }); // <- cast to Path
              },
              mouseout: () => {
                setHoverRainContour(null);
                (layer as L.Path).setStyle({ weight: 2 });
              },
            });

          }}
        />
      )}



      {layers.faultLines && faultsGeo && (
        <GeoJSON data={faultsGeo as any} style={faultsStyle} />
      )}

      {/* Fire stations from GeoJSON */}
      {layers.fireStations && fireStationsGeo && (
        <GeoJSON
          data={fireStationsGeo as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pointToLayer={(_feature: any, latlng) =>
            L.marker(latlng, { icon: fireStationIcon })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEachFeature={(feature: any, layer) => {
            const name = feature?.properties?.name as string | undefined;
            const island = feature?.properties?.island as string | undefined;
            const label = `${name ?? "Fire station"}${island ? ` (${island})` : ""
              }`;
            layer.bindPopup(label);
          }}
        />
      )}

      {/* Police stations from GeoJSON */}
      {layers.policeStations && policeStationsGeo && (
        <GeoJSON
          data={policeStationsGeo as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pointToLayer={(_feature: any, latlng) =>
            L.marker(latlng, { icon: policeIcon })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEachFeature={(feature: any, layer) => {
            const name = feature?.properties?.name as string | undefined;
            const island = feature?.properties?.island as string | undefined;
            const label = `${name ?? "Police station"}${island ? ` (${island})` : ""
              }`;
            layer.bindPopup(label);
          }}
        />
      )}

      {/* Point layers from CSV */}
      {layers.emergencySirens &&
        sirens.map((s, i) => (
          <Marker
            key={`siren-${i}`}
            position={[s.lat, s.lon]}
            icon={sirenIcon}
          >
            <Popup>{s.label}</Popup>
          </Marker>
        ))}

      {layers.hurricaneShelters &&
        shelters.map((s, i) => (
          <Marker
            key={`shelter-${i}`}
            position={[s.lat, s.lon]}
            icon={shelterIcon}
          >
            <Popup>{s.label}</Popup>
          </Marker>
        ))}

      {/* Custom user locations: marker + radius circle */}
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
        const nearbySirens = countPointsWithinRadius(
          loc.lat,
          loc.lon,
          radiusMeters,
          sirens
        );
        const nearbyShelters = countPointsWithinRadius(
          loc.lat,
          loc.lon,
          radiusMeters,
          shelters
        );

        return (
          <React.Fragment key={loc.id}>
            <Marker position={[loc.lat, loc.lon]} icon={userLocationIcon}>
              <Popup>
                <div>
                  <div>
                    <strong>Custom location</strong>
                  </div>
                  <div>Radius: {loc.radiusMiles} mi</div>
                  <div style={{ marginTop: 4 }}>
                    {nearbyFire} fire stations, {nearbyPolice} police stations
                    <br />
                    {nearbyShelters} shelters, {nearbySirens} sirens
                  </div>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[loc.lat, loc.lon]}
              radius={radiusMeters}
              pathOptions={{
                color: "#0f766e",
                fillColor: "#0f766e",
                fillOpacity: 0.3,
                weight: 2
              }}
            />
          </React.Fragment>
        );
      })}

    </MapContainer>
  );
}



export default LeafletMap;
