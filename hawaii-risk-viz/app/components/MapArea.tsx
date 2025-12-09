// app/components/MapArea.tsx
"use client";

import dynamic from "next/dynamic";
import type { LayerVisibility } from "./CheckboxPanel";

// Tell `dynamic` what props LeafletMap expects
const LeafletMap = dynamic<{ layers: LayerVisibility }>(
  () => import("./LeafletMap"),
  {
    ssr: false,
  }
);

interface MapAreaProps {
  layers: LayerVisibility;
}

export default function MapArea({ layers }: MapAreaProps) {
  return <LeafletMap layers={layers} />;
}
