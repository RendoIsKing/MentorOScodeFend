"use client";

import React from "react";

interface WorkoutWidgetPreviewProps {
  workout: {
    name: string;
    duration: string;
    difficulty: string;
    exercises: Array<{ name: string; sets: number }>;
    focus: string[];
  };
}

// Verbatim copy of export preview widget (safe for Next).
export default function WorkoutWidgetPreview({ workout }: WorkoutWidgetPreviewProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .workout-preview-container * {
          color: #111827 !important;
        }
        .workout-preview-container .gray-text {
          color: #6b7280 !important;
        }
        .workout-preview-container .orange-text {
          color: #c2410c !important;
        }
        .workout-preview-container .white-text {
          color: #ffffff !important;
        }
      `,
        }}
      />
      <div
        className="workout-preview-container"
        style={{
          padding: "16px",
          border: "1px solid #fed7aa",
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "linear-gradient(to bottom right, #ea580c, #f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 20h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
              <path d="M14 20h4a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Z" />
              <path d="M6 2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
              <path d="M14 10h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <span style={{ fontWeight: "600", fontSize: "16px", lineHeight: "24px" }}>{workout.name}</span>
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
            <div className="gray-text" style={{ fontSize: "12px", marginBottom: "4px", lineHeight: "16px" }}>
              Duration
            </div>
            <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "20px" }}>{workout.duration}</div>
          </div>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
            <div className="gray-text" style={{ fontSize: "12px", marginBottom: "4px", lineHeight: "16px" }}>
              Difficulty
            </div>
            <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "20px" }}>{workout.difficulty}</div>
          </div>
        </div>

        {/* Exercises Box */}
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: "12px" }}>
          <div className="gray-text" style={{ fontSize: "12px", marginBottom: "8px", lineHeight: "16px" }}>
            Exercises ({workout.exercises?.length || 0})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {workout.exercises?.slice(0, 3).map((ex, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span style={{ fontSize: "14px", flex: 1, lineHeight: "20px" }}>{ex.name}</span>
                <span className="gray-text" style={{ fontSize: "12px", lineHeight: "16px" }}>
                  {ex.sets} sets
                </span>
              </div>
            ))}
            {workout.exercises?.length > 3 && (
              <div className="gray-text" style={{ fontSize: "12px", marginTop: "4px", lineHeight: "16px" }}>
                +{workout.exercises.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Focus Tags */}
        {workout.focus?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {workout.focus.map((f, idx) => (
              <span
                key={idx}
                className="orange-text"
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#ffedd5",
                  border: "1px solid #fed7aa",
                  lineHeight: "16px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


