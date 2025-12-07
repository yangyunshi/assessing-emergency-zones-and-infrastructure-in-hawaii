"use client";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

function AddLocation({ open, onClose }: Props) {
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  if (!open) return null; // do not render when closed

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      {/* Modal content box */}
      <div
        style={{
          width: "600px",
          padding: "30px",
          backgroundColor: "white",
          color: "black",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
        }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h3 style={{
          marginTop: 0,
          marginBottom: "16px",
          fontSize: "1.1rem",
          fontWeight: 600
        }}>Add a Location</h3>

        <label style={{display: "block", marginBottom: "14px"}}>
          Latitude:
          <input
            type="number"
            step="0.000001"
            placeholder="e.g., 21.3069"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.95rem"
            }}
          />
        </label>

        <label style={{display: "block", marginBottom: "18px"}}>
          Longitude:
          <input
            type="number"
            step="0.000001"
            placeholder="e.g., -157.8583"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.95rem"
            }}
          />
        </label>

        <div style={{marginBottom: "18px"}}>
          <div
            style={{
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Check Nearby Risks:
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px"
            }}
          >
            {[5, 10, 15, 20].map((miles) => (
              <button
                key={miles}
                onClick={() => setSelectedDistance(miles)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: selectedDistance === miles
                    ? "2px solid #3ac2a0"
                    : "1px solid #999",
                  backgroundColor: selectedDistance === miles
                    ? "#e7f9f4"
                    : "#f5f5f5",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: selectedDistance === miles ? 600 : 400
                }}
              >
                {miles} mi
              </button>
            ))}
          </div>
        </div>

        <div style={{display: "flex", justifyContent: "flex-end", gap: "8px"}}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #777",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#3ac2a0ff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddLocation;