"use client";

import dynamic from "next/dynamic";
import type { LayerVisibility } from "./CheckboxPanel";

type UserLocation = {
  id: string;
  lat: number;
  lon: number;
  radiusMiles: number;
};

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false
});

interface MapAreaProps {
  layers: LayerVisibility;
  userLocations?: UserLocation[];
}

export default function MapArea({ layers, userLocations = [] }: MapAreaProps) {
  return <LeafletMap layers={layers} userLocations={userLocations} />;
}
