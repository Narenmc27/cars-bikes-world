import { ImageResponse } from "next/og";

export const alt = "Cars & Bikes World";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05060a, #0b3b4a 50%, #4a0b4a)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#67e8f9" }}>
          EVERY MACHINE. EVERY ERA.
        </div>
        <div style={{ display: "flex", fontSize: 110, fontWeight: 800, marginTop: 20 }}>
          Cars & Bikes World
        </div>
      </div>
    ),
    size
  );
}