"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as d3 from "d3";
import type { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false
});

interface MapAreaProps {
  showSirens: boolean;
}

interface ParsedSiren {
  lat: number;
  lon: number;
  label: string;
  decibel: number;
}

type SirenRow = {
  [key: string]: string | undefined;
};

function MapArea({ showSirens }: MapAreaProps) {
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSirens() {
      // base invisible trace to force a geo map
      const baseTrace: Data = {
        type: "scattergeo",
        lat: [],
        lon: [],
        hoverinfo: "skip",
        showlegend: false
      };

      if (!showSirens) {
        setData([baseTrace]);
        return;
      }

      const rows = (await d3.csv(
        "/data/Emergency-Sirens.csv"
      )) as SirenRow[];

      const parsed: ParsedSiren[] = rows
        .map((row: SirenRow) => {
          const loc1 = row["Location 1"] ?? "";
          const location = row.LOCATION ?? "";
          const decibelStr = row.DECIBEL ?? "";

          const match = loc1.match(/\(([^,]+),\s*([^)]+)\)/);
          if (!match) {
            return null;
          }

          const lat = Number(match[1]);
          const lon = Number(match[2]);
          const decibel = Number(decibelStr);

          if (Number.isNaN(lat) || Number.isNaN(lon)) {
            return null;
          }

          return {
            lat,
            lon,
            label: `${location} (${decibelStr} dB)`,
            decibel
          };
        })
        .filter((siren): siren is ParsedSiren => siren !== null);

      if (parsed.length === 0) {
        setData([baseTrace]);
        return;
      }

      const sirenTrace: Data = {
        type: "scattergeo",
        mode: "markers",
        lat: parsed.map((s) => s.lat),
        lon: parsed.map((s) => s.lon),
        text: parsed.map((s) => s.label),
        marker: {
          size: 8,
          color: parsed.map((s) => s.decibel),
          colorscale: "Hot",
          reversescale: true,
          colorbar: {
            title: { text: "Decibel Level" }
          }
        },
        name: "Emergency Sirens"
      };

      if (!cancelled) {
        setData([baseTrace, sirenTrace]);
      }
    }

    void loadSirens();

    return () => {
      cancelled = true;
    };
  }, [showSirens]);

  const layout: Partial<Layout> = {
    geo: {
      scope: "world",
      projection: { type: "mercator" },
      showland: true,
      landcolor: "#f0efe9",
      // keep the map focused around Hawaiʻi
      center: { lat: 20.5, lon: -156.5 },
      lonaxis: { range: [-170, -140] },
      lataxis: { range: [10, 30] }
    },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
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
        scrollZoom: false
      }}
    />
  );
}

export default MapArea;
