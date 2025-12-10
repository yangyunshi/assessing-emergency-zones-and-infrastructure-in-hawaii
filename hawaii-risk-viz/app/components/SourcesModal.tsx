"use client";

import React from "react";

export type SourceLink = {
  label: string;
  url: string;
};

type Props = {
  open: boolean;
  title: string;
  sources: SourceLink[];
  onClose: () => void;
};

export default function SourcesModal({ open, title, sources, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={{
          width: "720px",
          maxWidth: "92vw",
          padding: "18px 18px 14px",
          backgroundColor: "white",
          color: "black",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px"
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{title}</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 10px",
              borderRadius: "10px",
              border: "1px solid #777",
              cursor: "pointer",
              backgroundColor: "#f5f5f5"
            }}
            aria-label="Close sources"
          >
            Close
          </button>
        </div>

        <ul style={{ margin: 0, paddingLeft: "18px" }}>
          {sources.map((s) => (
            <li key={s.url} style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: 600 }}>{s.label}</div>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  wordBreak: "break-all",
                  fontSize: "0.9rem"
                }}
              >
                {s.url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
