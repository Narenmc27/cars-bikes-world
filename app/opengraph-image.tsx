import { ImageResponse } from "next/og";

export const alt = "Cars & Bikes World";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const squares = Array.from({ length: 50 });
  const row = (offset: number) => (
    <div style={{ display: "flex" }}>
      {squares.map((_, i) => (
        <div
          key={i}
          style={{
            width: 24,
            height: 24,
            background: (i + offset) % 2 === 0 ? "#14110f" : "#ece3cb",
          }}
        />
      ))}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#17302a",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#c8392b",
              border: "12px solid #ece3cb",
              borderRadius: 32,
              padding: "40px 72px",
              boxShadow: "16px 16px 0 #0b1a16",
            }}
          >
            <div style={{ display: "flex", fontSize: 110, fontWeight: 800, color: "#ece3cb", lineHeight: 1 }}>
              Cars &amp; Bikes
            </div>
            <div style={{ display: "flex", fontSize: 110, fontWeight: 800, color: "#ece3cb", lineHeight: 1 }}>
              World
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                background: "#e2a82a",
                color: "#1a1510",
                fontSize: 34,
                fontWeight: 700,
                padding: "8px 28px",
              }}
            >
              Machines from 1886 to today
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {row(0)}
          {row(1)}
        </div>
      </div>
    ),
    size
  );
}