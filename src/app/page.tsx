"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchNews,
  fetchLabelStats,
  updateNewsRow,
  NewsRow,
  Label,
  LABEL_OPTIONS,
  PAGE_SIZE,
} from "@/lib/supabase";
import StatsBar from "@/components/StatsBar";
import LabelSelect from "@/components/LabelSelect";
import SymbolCell from "@/components/SymbolCell";

type LabelFilter = "all" | "unlabeled" | "positive" | "neutral" | "negative" | "trash";

const LABEL_BADGE: Record<string, { color: string; bg: string; border: string }> = {
  positive: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  neutral:  { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  negative: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  trash:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
};

export default function HomePage() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, positive: 0, neutral: 0, negative: 0, trash: 0, unlabeled: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNews({ page, labelFilter, symbolFilter, search });
      setRows(result.data);
      setCount(result.count);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, labelFilter, symbolFilter, search]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fetchLabelStats();
      setStats(s as typeof stats);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadStats(); }, [loadStats]);

  function handleSearchInput(v: string) {
    setSearchInput(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(0); }, 400);
  }

  function handleFilter<T>(setter: (v: T) => void, val: T) {
    setter(val);
    setPage(0);
  }

  async function handleLabelSave(id: string, label: Label) {
    setSaveErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    try {
      await updateNewsRow(id, { label });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, label } : r));
      fetchLabelStats().then((s) => setStats(s as typeof stats));
    } catch (e) {
      setSaveErrors((prev) => ({ ...prev, [id]: (e as Error).message }));
    }
  }

  async function handleSymbolSave(id: string, symbol: string | null) {
    try {
      await updateNewsRow(id, { symbol });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, symbol } : r));
    } catch (e) {
      setSaveErrors((prev) => ({ ...prev, [id + "_sym"]: (e as Error).message }));
    }
  }

  function formatDate(s: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  const pages = buildPageList(page, totalPages);

  return (
    <div style={shell}>
      {/* ── TOP BAR ── */}
      <header style={topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoBox}>W</div>
          <div>
            <h1 style={logoText}>Wealbee Labeling</h1>
            <p style={logoSub}>Gán nhãn dữ liệu tin tức thị trường</p>
          </div>
        </div>
        <button onClick={() => { loadData(); loadStats(); }} style={refreshBtnStyle}>
          ↻ Làm mới
        </button>
      </header>

      <main style={main}>
        {/* ── STATS ── */}
        {!statsLoading && <StatsBar stats={stats} />}

        {/* ── FILTERS ── */}
        <div style={filtersRow}>
          <div style={searchWrap}>
            <span style={searchIcon}>🔍</span>
            <input
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề..."
              style={searchInput_}
            />
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}>Nhãn</label>
            <select
              value={labelFilter}
              onChange={(e) => handleFilter(setLabelFilter, e.target.value as LabelFilter)}
              style={filterSelect}
            >
              <option value="all">Tất cả</option>
              <option value="unlabeled">⬜ Chưa gán</option>
              {LABEL_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value!}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}>Symbol</label>
            <select
              value={symbolFilter}
              onChange={(e) => handleFilter(setSymbolFilter, e.target.value)}
              style={filterSelect}
            >
              <option value="all">Tất cả</option>
              <option value="no_symbol">— Không có —</option>
              <option value="VĨ MÔ">VĨ MÔ</option>
              <option value="VNINDEX">VNINDEX</option>
              <option value="HNX">HNX</option>
              <option value="UPCOM">UPCOM</option>
              <option value="GOLD">GOLD</option>
              <option value="USD/VND">USD/VND</option>
              <option value="OIL">OIL</option>
              <option value="LÃISUẤT">LÃISUẤT</option>
              <option value="TRÁIPHIẾU">TRÁIPHIẾU</option>
              <option value="BĐS">BĐS</option>
              <option value="CRYPTO">CRYPTO</option>
            </select>
          </div>

          <span style={resultCount}>
            {count.toLocaleString()} bài
          </span>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={errorBox}>
            ⚠️ {error}
            <button onClick={loadData} style={retryBtn}>Thử lại</button>
          </div>
        )}

        {/* ── TABLE ── */}
        <div style={card}>
          {loading ? (
            <div style={loadingBox}>
              <div style={spinnerStyle} />
              <span style={{ color: "#6b7a90", marginTop: 12 }}>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th style={{ ...th, width: 44, textAlign: "center" }}>STT</th>
                  <th style={{ ...th, width: 120 }}>Symbol</th>
                  <th style={{ ...th, width: 110 }}>Ngày đăng</th>
                  <th style={{ ...th, width: 80 }}>Nguồn</th>
                  <th style={th}>Tiêu đề & Nội dung</th>
                  <th style={{ ...th, width: 150 }}>Nhãn</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={emptyCell}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : rows.map((row, idx) => {
                  const isExpanded = expandedId === row.id;
                  const badge = row.label ? LABEL_BADGE[row.label] : null;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        ...trBase,
                        borderLeft: badge ? `4px solid ${badge.border}` : "4px solid transparent",
                        background: badge ? badge.bg : idx % 2 === 0 ? "#fff" : "#fafbfc",
                      }}
                    >
                      {/* STT */}
                      <td style={{ ...td, textAlign: "center", color: "#9aa5b4", fontSize: 13 }}>
                        {page * PAGE_SIZE + idx + 1}
                      </td>

                      {/* Symbol */}
                      <td style={td}>
                        <SymbolCell id={row.id} value={row.symbol} onSave={handleSymbolSave} />
                      </td>

                      {/* Date */}
                      <td style={{ ...td, color: "#6b7a90", fontSize: 13, whiteSpace: "nowrap" }}>
                        {formatDate(row.published_at)}
                      </td>

                      {/* Source */}
                      <td style={{ ...td, fontSize: 12 }}>
                        <span style={sourceBadge}>{row.source ?? "—"}</span>
                      </td>

                      {/* Title */}
                      <td style={td}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : row.id)}
                          style={titleBtn}
                        >
                          <span style={titleText}>{row.title}</span>
                          <span style={expandHint}>{isExpanded ? "▲ Thu gọn" : "▼ Xem thêm"}</span>
                          {row.article_url && (
                            <a
                              href={row.article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={linkStyle}
                            >
                              ↗ Xem bài
                            </a>
                          )}
                        </button>
                        {isExpanded && row.content && (
                          <div style={contentBox}>{row.content}</div>
                        )}
                        {saveErrors[row.id] && (
                          <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
                            ⚠️ {saveErrors[row.id]}
                          </p>
                        )}
                      </td>

                      {/* Label */}
                      <td style={{ ...td, verticalAlign: "middle" }}>
                        <LabelSelect id={row.id} value={row.label} onSave={handleLabelSave} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {!loading && totalPages > 1 && (
          <div style={paginationRow}>
            <button onClick={() => setPage(0)} disabled={page === 0} style={pgBtn(page === 0)}>«</button>
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} style={pgBtn(page === 0)}>‹</button>

            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} style={dots}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  style={pgBtn(false, p === page)}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1} style={pgBtn(page >= totalPages - 1)}>›</button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={pgBtn(page >= totalPages - 1)}>»</button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Build smart page list (1 2 3 ... 8 9 10) ──
function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "...")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(0);
  if (current > 3) pages.push("...");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i);
  if (current < total - 4) pages.push("...");
  add(total - 1);
  return pages;
}

// ── Styles ──
const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f7fa",
  display: "flex",
  flexDirection: "column",
};
const topbar: React.CSSProperties = {
  background: "#fff",
  borderBottom: "1px solid #e2e6ed",
  padding: "14px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};
const logoBox: React.CSSProperties = {
  width: 36,
  height: 36,
  background: "linear-gradient(135deg, #4f6ef7, #818cf8)",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 800,
  fontSize: 18,
};
const logoText: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#1a2130",
  letterSpacing: "-0.02em",
};
const logoSub: React.CSSProperties = {
  fontSize: 12,
  color: "#9aa5b4",
};
const refreshBtnStyle: React.CSSProperties = {
  background: "#f5f7fa",
  border: "1px solid #e2e6ed",
  borderRadius: 8,
  color: "#6b7a90",
  cursor: "pointer",
  padding: "8px 16px",
  fontWeight: 500,
  fontSize: 13,
  transition: "background 0.15s",
};
const main: React.CSSProperties = {
  flex: 1,
  maxWidth: 1440,
  width: "100%",
  margin: "0 auto",
  padding: "24px 32px 60px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};
const filtersRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-end",
  flexWrap: "wrap",
};
const searchWrap: React.CSSProperties = {
  position: "relative",
  flex: "1 1 260px",
  minWidth: 200,
};
const searchIcon: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 14,
  pointerEvents: "none",
};
const searchInput_: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1.5px solid #e2e6ed",
  borderRadius: 8,
  color: "#1a2130",
  padding: "9px 12px 9px 36px",
  outline: "none",
  fontSize: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const filterGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const filterLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#9aa5b4",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  paddingLeft: 2,
};
const filterSelect: React.CSSProperties = {
  background: "#fff",
  border: "1.5px solid #e2e6ed",
  borderRadius: 8,
  color: "#1a2130",
  padding: "9px 28px 9px 12px",
  cursor: "pointer",
  minWidth: 140,
  outline: "none",
  fontSize: 13,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const resultCount: React.CSSProperties = {
  color: "#9aa5b4",
  fontSize: 13,
  alignSelf: "flex-end",
  paddingBottom: 9,
  whiteSpace: "nowrap",
  marginLeft: "auto",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e2e6ed",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};
const theadRow: React.CSSProperties = {
  background: "#f5f7fa",
  borderBottom: "2px solid #e2e6ed",
};
const th: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7a90",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  whiteSpace: "nowrap",
};
const trBase: React.CSSProperties = {
  borderBottom: "1px solid #f0f2f5",
  transition: "background 0.1s",
};
const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "top",
};
const sourceBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#f0f2f5",
  border: "1px solid #e2e6ed",
  borderRadius: 5,
  padding: "2px 8px",
  color: "#6b7a90",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const titleBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "baseline",
};
const titleText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#1a2130",
  lineHeight: 1.5,
  flex: "1 1 auto",
};
const expandHint: React.CSSProperties = {
  fontSize: 11,
  color: "#9aa5b4",
  flexShrink: 0,
};
const linkStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#4f6ef7",
  textDecoration: "none",
  fontWeight: 500,
  flexShrink: 0,
};
const contentBox: React.CSSProperties = {
  marginTop: 10,
  padding: "12px 14px",
  background: "#f5f7fa",
  borderRadius: 8,
  border: "1px solid #e2e6ed",
  fontSize: 13,
  color: "#374151",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  maxHeight: 280,
  overflow: "auto",
  animation: "fadeIn 0.15s ease",
};
const emptyCell: React.CSSProperties = {
  textAlign: "center",
  padding: "60px 0",
  color: "#9aa5b4",
  fontSize: 15,
};
const loadingBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "60px 0",
};
const spinnerStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "3px solid #e2e6ed",
  borderTopColor: "#4f6ef7",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#dc2626",
  padding: "12px 16px",
  display: "flex",
  gap: 12,
  alignItems: "center",
};
const retryBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #dc2626",
  borderRadius: 6,
  color: "#dc2626",
  cursor: "pointer",
  padding: "3px 10px",
  fontSize: 12,
  marginLeft: "auto",
};
const paginationRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
  flexWrap: "wrap",
};
const dots: React.CSSProperties = {
  color: "#9aa5b4",
  padding: "0 4px",
  userSelect: "none",
};
function pgBtn(disabled: boolean, active = false): React.CSSProperties {
  return {
    minWidth: 36,
    height: 36,
    background: active ? "#4f6ef7" : disabled ? "#f5f7fa" : "#fff",
    border: `1.5px solid ${active ? "#4f6ef7" : "#e2e6ed"}`,
    borderRadius: 8,
    color: active ? "#fff" : disabled ? "#cbd2da" : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: active ? 700 : 400,
    fontSize: 13,
    transition: "all 0.15s",
  };
}
