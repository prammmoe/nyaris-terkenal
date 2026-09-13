import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nyaris Terkenal — semakin nggak terkenal, semakin banyak poin.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "58px 68px",
          color: "#29264d",
          background: "#f8f7ff",
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 62,
              height: 62,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "#7559e8",
              color: "white",
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            NT
          </div>
          <span style={{ fontSize: 29, fontWeight: 800 }}>Nyaris Terkenal</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 54 }}>
          <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -3 }}>
            Semakin nggak terkenal,
          </span>
          <span style={{ color: "#7559e8", fontSize: 64, fontWeight: 800, letterSpacing: -3 }}>
            semakin banyak poin.
          </span>
          <span style={{ marginTop: 20, color: "#5d5a75", fontSize: 27, fontWeight: 700 }}>
            Party game tebak jawaban yang masih masuk Top 100.
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
          {[
            ["#1", "+1 poin", "#ff7167"],
            ["#94", "+94 poin", "#55d79a"],
            ["—", "+0 poin", "#63adf0"],
          ].map(([rank, points, color]) => (
            <div
              key={rank}
              style={{
                display: "flex",
                width: 250,
                flexDirection: "column",
                gap: 7,
                padding: "18px 22px",
                borderRadius: 20,
                background: color,
                borderBottom: "6px solid rgba(35, 30, 75, 0.22)",
                color: "white",
              }}
            >
              <span style={{ fontSize: 40, fontWeight: 800 }}>{rank}</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{points}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
