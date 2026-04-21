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

  return (
    <div style={bar}>
      <div style={item}>
        <span style={num}>{stats.total.toLocaleString()}</span>
        <span style={label}>Tổng</span>
      </div>
      <div style={divider} />
      <div style={item}>
        <span style={{ ...num, color: "#16a34a" }}>{stats.positive.toLocaleString()}</span>
        <span style={label}>Positive</span>
      </div>
      <div style={item}>
        <span style={{ ...num, color: "#2563eb" }}>{stats.neutral.toLocaleString()}</span>
        <span style={label}>Neutral</span>
      </div>
      <div style={item}>
        <span style={{ ...num, color: "#dc2626" }}>{stats.negative.toLocaleString()}</span>
        <span style={label}>Negative</span>
      </div>
      <div style={item}>
        <span style={{ ...num, color: "#d97706" }}>{stats.trash.toLocaleString()}</span>
        <span style={label}>Trash</span>
      </div>
      <div style={divider} />
      <div style={item}>
        <span style={{ ...num, color: "#a78bfa" }}>{stats.unlabeled.toLocaleString()}</span>
        <span style={label}>Chưa gán</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={progressWrap}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{pct}% hoàn thành</span>
        <div style={track}>
          <div style={{ ...fill, width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

const bar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  background: "#1a1d27",
  border: "1px solid #2e3148",
  borderRadius: 8,
  padding: "10px 20px",
  flexWrap: "wrap",
};
const item: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: 60,
};
const num: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.2,
};
const label: React.CSSProperties = {
  fontSize: 11,
  color: "#8892a4",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const divider: React.CSSProperties = {
  width: 1,
  height: 32,
  background: "#2e3148",
};
const progressWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 160,
};
const track: React.CSSProperties = {
  height: 6,
  background: "#2e3148",
  borderRadius: 3,
  overflow: "hidden",
};
const fill: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #6366f1, #a78bfa)",
  borderRadius: 3,
  transition: "width 0.4s ease",
};
