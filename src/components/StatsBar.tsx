"use client";

interface Stats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  trash: number;
  unlabeled: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const labeled = stats.total - stats.unlabeled;
  const pct = stats.total > 0 ? Math.round((labeled / stats.total) * 100) : 0;

  const items = [
    { label: "Tổng bài", value: stats.total, color: "#4f6ef7", bg: "#eef1fe" },
    { label: "Positive", value: stats.positive, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Neutral", value: stats.neutral, color: "#2563eb", bg: "#eff6ff" },
    { label: "Negative", value: stats.negative, color: "#dc2626", bg: "#fef2f2" },
    { label: "Trash", value: stats.trash, color: "#d97706", bg: "#fffbeb" },
    { label: "Chưa gán", value: stats.unlabeled, color: "#6b7a90", bg: "#f0f2f5" },
  ];

  return (
    <div style={wrapStyle}>
      {items.map((item) => (
        <div key={item.label} style={{ ...cardStyle, background: item.bg }}>
          <span style={{ ...numStyle, color: item.color }}>
            {item.value.toLocaleString()}
          </span>
          <span style={labelStyle}>{item.label}</span>
        </div>
      ))}

      <div style={progressCard}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#6b7a90", fontWeight: 500 }}>Tiến độ gán nhãn</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#4f6ef7" }}>{pct}%</span>
        </div>
        <div style={trackStyle}>
          <div style={{ ...fillStyle, width: `${pct}%` }} />
        </div>
        <span style={{ fontSize: 12, color: "#9aa5b4", marginTop: 6, display: "block" }}>
          {labeled.toLocaleString()} / {stats.total.toLocaleString()} bài
        </span>
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr) 2fr",
  gap: 12,
  alignItems: "stretch",
};
const cardStyle: React.CSSProperties = {
  borderRadius: 10,
  padding: "14px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  border: "1px solid rgba(0,0,0,0.06)",
};
const numStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7a90",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const progressCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 10,
  padding: "14px 16px",
  border: "1px solid #e2e6ed",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
const trackStyle: React.CSSProperties = {
  height: 8,
  background: "#e2e6ed",
  borderRadius: 4,
  overflow: "hidden",
};
const fillStyle: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #4f6ef7, #818cf8)",
  borderRadius: 4,
  transition: "width 0.5s ease",
};
