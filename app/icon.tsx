import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c8392b",
          border: "4px solid #ece3cb",
          borderRadius: 12,
          color: "#ece3cb",
          fontSize: 40,
          fontWeight: 800,
        }}
      >
        C
      </div>
    ),
    size
  );
}