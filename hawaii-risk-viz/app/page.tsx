// app/page.tsx

import CheckboxPanel from "./components/CheckboxPanel";
import MapArea from "./components/MapArea";

export default function HomePage() {
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
          gap: "12px"
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
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
          }}
        >
          <CheckboxPanel />
        </aside>

        {/* Map area */}
        <section
          style={{
            flexGrow: 1,
            backgroundColor: "#c0c0c0",
            borderRadius: "4px",
            padding: "8px",
            boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
          }}
        >
          <MapArea />
        </section>
      </section>
    </main>
  );
}
