import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

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
          background: "#17191b",
          border: "4px solid #ef4444",
          borderRadius: "16px",
          color: "#f8fafc",
          fontSize: 38,
          fontWeight: 800,
          position: "relative",
        }}
      >
        K
        <div
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#34d399",
            boxShadow: "0 0 12px #34d399",
          }}
        />
      </div>
    ),
    size,
  );
}
