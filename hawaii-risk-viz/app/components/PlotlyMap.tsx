"use client";

import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";

// Simple client-only Plotly wrapper
const PlotlyMap = dynamic<PlotParams>(() => import("react-plotly.js"), {
  ssr: false
});

export default PlotlyMap;
