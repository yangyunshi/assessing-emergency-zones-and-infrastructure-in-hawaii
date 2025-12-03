"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

// Client-side Plotly component
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false
});

function MapArea() {
  const data: Data[] = [
    {
      type: "scattergeo",
      lon: [-157.8583],
      lat: [21.3069],
      mode: "markers",
      marker: { size: 8 },
      name: "Honolulu"
    }
  ];

  const layout: Partial<Layout> = {
    geo: {
      scope: "world",
      projection: { type: "mercator" },
      showland: true,
      landcolor: "#f0efe9",
      lonaxis: { range: [-170, -140] },
      lataxis: { range: [10, 30] },
      domain: { x: [0, 1], y: [0, 1] }
    },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff"
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%"
      }}
    >
      <Plot
        data={data}
        layout={layout}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
        config={{
          displayModeBar: true, // shows zoom / pan / home buttons
          scrollZoom: false     // avoid the weird zoom-out strip bug
        }}
      />
    </div>
  );
}

export default MapArea;
