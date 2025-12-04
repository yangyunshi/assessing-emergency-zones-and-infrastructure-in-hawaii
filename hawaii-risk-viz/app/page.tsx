"use client";

import { useState } from "react";
import CheckboxPanel from "./components/CheckboxPanel";
import MapArea from "./components/MapArea";

export default function HomePage() {
  // What the checkbox currently shows
  const [pendingSirens, setPendingSirens] = useState(true);

  // What the map is actually using
  const [showSirens, setShowSirens] = useState(true);

  const handleToggleSirens = () => {
    setPendingSirens((prev) => !prev);
  };

  const handleUpdateMap = () => {
    setShowSirens(pendingSirens);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#d6d6d6"
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: "40px",
          backgroundColor: "#3b1515",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontSize: "0.95rem",
          fontWeight: 500
        }}
      >
        Assessing Natural Disaster Risk in Hawaiʻi
      </header>

      {/* Content area */}
      <section
        style={{
          flexGrow: 1,
          display: "flex",
          padding: "16px",
          boxSizing: "border-box"
        }}
      >
        {/* Left sidebar */}
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
            pendingSirens={pendingSirens}
            onToggleSirens={handleToggleSirens}
            onUpdateMap={handleUpdateMap}
          />
        </aside>

        {/* Map area */}
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
          <MapArea showSirens={showSirens} />
        </section>
      </section>
    </main>
  );
}
