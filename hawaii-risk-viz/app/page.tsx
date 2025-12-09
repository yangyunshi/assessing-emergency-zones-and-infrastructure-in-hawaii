"use client";

import { useState } from "react";
import CheckboxPanel from "./components/CheckboxPanel";
import MapArea from "./components/MapArea";
import AboutPage from "./about";


export default function HomePage() {
  const [addedLocation, setAddedLocation] = useState<{
    lat: number;
    lon: number;
    radius?: number | null;
  } | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#d6d6d6"
      }}
    >
      <header
        style={{
          height: "40px",
          backgroundColor: "#3b1515",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          fontSize: "0.95rem",
          fontWeight: 500
        }}
      >
        Assessing Natural Disaster Risk in Hawaiʻi

        <button
          onClick={() => setAboutOpen(true)}
          style={{
            backgroundColor: "#ffffff",
            color: "#3b1515",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "none",
            fontWeight: 500,
            fontSize: "0.85rem",
            cursor: "pointer"
          }}
        >
          About
        </button>
      </header>

      <section
        style={{
          flexGrow: 1,
          display: "flex",
          padding: "16px",
          boxSizing: "border-box"
        }}
      >
        <aside
          style={{
            width: "260px",
            backgroundColor: "#e4e4e4",
            borderRadius: "4px",
            padding: "12px",
            boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            marginRight: "12px"
          }}
        >
          <CheckboxPanel
            onAddLocation={(lat, lon, radius) => {
              setAddedLocation({ lat, lon, radius });
            }}
          />
        </aside>

        {/* Map area: MapArea fills this completely */}
        <section
          style={{
            flexGrow: 1,
            display: "flex",
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
          }}
        >
          <MapArea newPoint={addedLocation || undefined} />
        </section>
      </section>
      <AboutPage open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
