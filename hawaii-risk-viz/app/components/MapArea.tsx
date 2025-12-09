"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

// Client-side Plotly component
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false
});

type MapAreaProps = {
  newPoint?: { lat: number; lon: number; radius?: number | null };
};

// Convert miles → degrees
function milesToDegrees(miles: number, lat: number) {
  const earthRadiusMiles = 3958.8;
  const latDegrees = (miles / earthRadiusMiles) * (180 / Math.PI);
  const lonDegrees =
    (miles / (earthRadiusMiles * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  return { latDegrees, lonDegrees };
}

// Generate circle coords
function generateCirclePoints(lat: number, lon: number, radiusMiles: number) {
  const { latDegrees, lonDegrees } = milesToDegrees(radiusMiles, lat);

  const circleLat: number[] = [];
  const circleLon: number[] = [];

  for (let angle = 0; angle <= 360; angle++) {
    const rad = (angle * Math.PI) / 180;
    circleLat.push(lat + latDegrees * Math.sin(rad));
    circleLon.push(lon + lonDegrees * Math.cos(rad));
  }

  return { circleLat, circleLon };
}

function MapArea({ newPoint }: MapAreaProps) {
  const data: Data[] = [
    {
      type: "scattergeo",
      lon: [-157.8583],
      lat: [21.3069],
      mode: "markers",
      marker: { size: 8 },
      name: "Honolulu",
      showlegend: false
    },
    ...(newPoint
      ? [
        {
          type: "scattergeo",
          lon: [newPoint.lon],
          lat: [newPoint.lat],
          mode: "markers",
          marker: { size: 10, color: "red" },
          name: "Added Location"
        }
      ]
      : [])
  ];

  // Add radius circle if radius exists
  if (newPoint && newPoint.radius && newPoint.radius > 0) {
    const { circleLat, circleLon } = generateCirclePoints(
      newPoint.lat,
      newPoint.lon,
      newPoint.radius
    );

    const circleTrace: Data = {
      type: "scattergeo",
      lat: circleLat,
      lon: circleLon,
      mode: "lines",
      line: { color: "rgba(255,0,0,0.5)", width: 2 },
      name: `${newPoint.radius} mi radius`
    };

    data.push(circleTrace);
  }

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
    plot_bgcolor: "#ffffff",
    legend: {
      x: 1,
      y: 0.8,
      xanchor: "left",
      yanchor: "top"
    }
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
