// app/components/CheckboxPanel.tsx

function CheckboxPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      {/* Card with three checkboxes */}
      {/* Card 1 */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            General Safety Infrastructure
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input type="checkbox" /> Police Stations
          </label>
          <label>
            <input type="checkbox" /> Emergency Sirens
          </label>
          <label>
            <input type="checkbox" /> Hurricane Shelters
          </label>
        </div>
      </section>

      {/* Card with three checkboxes */}
      {/* Card 2 */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Fire Disasters
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input type="checkbox" /> Fire Stations
          </label>
          <label>
            <input type="checkbox" /> Fire Risk Zones
          </label>
          <label>
            <input type="checkbox" /> Lava Flow Zones
          </label>
        </div>
      </section>

      {/* Card with three checkboxes */}
      {/* Card 3 */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          marginBottom: "12px"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Tsunami and Flooding Disasters
          </span>
          <button
            type="button"
            aria-label="Help"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e0e0e0",
              fontSize: "0.8rem",
              cursor: "default"
            }}
          >
            ?
          </button>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "0.9rem"
          }}
        >
          <label>
            <input type="checkbox" /> Tsunami Risk Zones
          </label>
          <label>
            <input type="checkbox" /> Rainfall (mm)
          </label>
          <label>
            <input type="checkbox" /> Earthquake Fault Lines
          </label>
        </div>
      </section>

      {/* Spacer pushes buttons to bottom */}
      <div style={{ flexGrow: 1 }} />

      {/* Bottom buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <button
          type="button"
          style={{
            padding: "8px 10px",
            borderRadius: "16px",
            border: "1px solid #888",
            backgroundColor: "#3ac2a0ff",
            fontSize: "0.9rem",
            cursor: "pointer",
            alignSelf: "flex-start"
          }}
        >
          Add Location
        </button>

        <button
          type="button"
          style={{
            padding: "10px 16px",
            borderRadius: "18px",
            border: "none",
            backgroundColor: "#4b8b3b",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          Update Map
        </button>

        <button
          type="button"
          style={{
            marginTop: "4px",
            padding: "8px 10px",
            borderRadius: "16px",
            border: "1px solid #5c7d7a",
            backgroundColor: "#523949ff",
            fontSize: "0.85rem",
            cursor: "pointer",
            textAlign: "center"
          }}
        >
          Download Selected Data Sets
        </button>
      </div>
    </div>
  );
}

export default CheckboxPanel;
