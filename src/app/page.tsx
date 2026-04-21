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
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
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
    searchTimer.current = setTimeout(() => {
      setSearch(v);
      setPage(0);
    }, 400);
  }

  function handleFilterChange<T>(setter: (v: T) => void, val: T) {
    setter(val);
    setPage(0);
  }

  async function handleLabelSave(id: string, label: Label) {
    setSaving((s) => new Set(s).add(id));
    setSaveErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    try {
      await updateNewsRow(id, { label });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, label } : r));
      // Refresh stats in background
      fetchLabelStats().then((s) => setStats(s as typeof stats));
    } catch (e) {
      setSaveErrors((prev) => ({ ...prev, [id]: (e as Error).message }));
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  async function handleSymbolSave(id: string, symbol: string | null) {
    setSaving((s) => new Set(s).add(id + "_sym"));
    try {
      await updateNewsRow(id, { symbol });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, symbol } : r));
    } catch (e) {
      setSaveErrors((prev) => ({ ...prev, [id + "_sym"]: (e as Error).message }));
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(id + "_sym"); return n; });
    }
  }

  function formatDate(s: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function truncate(s: string | null, n = 120) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n) + "…" : s;
  }

  const labelColorMap: Record<string, string> = {
    positive: "#16a34a", neutral: "#2563eb", negative: "#dc2626", trash: "#d97706"
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Wealbee — Data Labeling</h1>
          <p style={subtitleStyle}>Gán nhãn dữ liệu tin tức thị trường</p>
        </div>
        <button onClick={() => { loadData(); loadStats(); }} style={refreshBtn}>
          ↻ Làm mới
        </button>
      </div>

      {/* Stats */}
      {!statsLoading && <StatsBar stats={stats} />}

      {/* Filters */}
      <div style={filtersStyle}>
        <input
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="🔍 Tìm theo tiêu đề..."
          style={inputStyle}
        />

        <select
          value={labelFilter}
          onChange={(e) => handleFilterChange(setLabelFilter, e.target.value as LabelFilter)}
          style={selectStyle}
        >
          <option value="all">Tất cả nhãn</option>
          <option value="unlabeled">⬜ Chưa gán</option>
          {LABEL_OPTIONS.filter((o) => o.value).map((o) => (
            <option key={o.value} value={o.value!}>{o.label}</option>
          ))}
        </select>

        <select
          value={symbolFilter}
          onChange={(e) => handleFilterChange(setSymbolFilter, e.target.value)}
          style={selectStyle}
        >
          <option value="all">Tất cả symbol</option>
          <option value="no_symbol">— Không có symbol —</option>
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

        <span style={countStyle}>
          {count.toLocaleString()} bài • Trang {page + 1}/{Math.max(1, totalPages)}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={errorStyle}>
          ⚠️ Lỗi: {error}
          <button onClick={loadData} style={{ marginLeft: 12, color: "#f87171", cursor: "pointer", background: "none", border: "none" }}>
            Thử lại
          </button>
        </div>
      )}

      {/* Table */}
      <div style={tableWrapStyle}>
        {loading ? (
          <div style={loadingStyle}>
            <div style={spinner} />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 40, textAlign: "center" }}>#</th>
                <th style={{ ...thStyle, width: 120 }}>Symbol</th>
                <th style={{ ...thStyle, width: 130 }}>Ngày</th>
                <th style={{ ...thStyle, width: 80 }}>Nguồn</th>
                <th style={thStyle}>Tiêu đề / Nội dung</th>
                <th style={{ ...thStyle, width: 145 }}>Nhãn</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isExpanded = expandedId === row.id;
                  const labelColor = row.label ? labelColorMap[row.label] : "transparent";
                  return (
                    <tr
                      key={row.id}
                      style={{
                        ...trStyle,
                        borderLeft: `3px solid ${labelColor}`,
                        background: idx % 2 === 0 ? "#1a1d27" : "#1e2235",
                      }}
                    >
                      {/* Row number */}
                      <td style={{ ...tdStyle, textAlign: "center", color: "#4b5563", fontSize: 12 }}>
                        {page * PAGE_SIZE + idx + 1}
                      </td>

                      {/* Symbol */}
                      <td style={tdStyle}>
                        <SymbolCell
                          id={row.id}
                          value={row.symbol}
                          onSave={handleSymbolSave}
                        />
                      </td>

                      {/* Date */}
                      <td style={{ ...tdStyle, color: "#8892a4", fontSize: 12, whiteSpace: "nowrap" }}>
                        {formatDate(row.published_at)}
                      </td>

                      {/* Source */}
                      <td style={{ ...tdStyle, fontSize: 12, color: "#6b7280" }}>
                        {row.source ?? "—"}
                      </td>

                      {/* Title / Content */}
                      <td style={tdStyle}>
                        <div>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : row.id)}
                            style={titleBtnStyle}
                          >
                            <span style={{ fontWeight: 500, color: "#e2e8f0", lineHeight: 1.4 }}>
                              {row.title}
                            </span>
                            {row.article_url && (
                              <a
                                href={row.article_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={linkStyle}
                              >
                                ↗
                              </a>
                            )}
                          </button>
                          {isExpanded && row.content && (
                            <p style={contentStyle}>{row.content}</p>
                          )}
                          {!isExpanded && row.content && (
                            <p style={previewStyle}>{truncate(row.content)}</p>
                          )}
                        </div>
                        {saveErrors[row.id] && (
                          <p style={{ color: "#f87171", fontSize: 11, marginTop: 2 }}>
                            ⚠️ {saveErrors[row.id]}
                          </p>
                        )}
                      </td>

                      {/* Label */}
                      <td style={{ ...tdStyle }}>
                        <LabelSelect
                          id={row.id}
                          value={row.label}
                          onSave={handleLabelSave}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            style={pageBtn(page === 0)}
          >«</button>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={pageBtn(page === 0)}
          >‹ Trước</button>

          {/* Page number input */}
          <span style={{ color: "#8892a4", display: "flex", alignItems: "center", gap: 6 }}>
            Trang
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page + 1}
              onChange={(e) => {
                const v = parseInt(e.target.value) - 1;
                if (!isNaN(v) && v >= 0 && v < totalPages) setPage(v);
              }}
              style={pageInputStyle}
            />
            / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={pageBtn(page >= totalPages - 1)}
          >Tiếp ›</button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            style={pageBtn(page >= totalPages - 1)}
          >»</button>
        </div>
      )}
    </div>
  );
}

// Styles
const pageStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px 16px 60px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  paddingBottom: 8,
  borderBottom: "1px solid #2e3148",
};
const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#e2e8f0",
  letterSpacing: "-0.02em",
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  marginTop: 2,
};
const refreshBtn: React.CSSProperties = {
  background: "#232635",
  border: "1px solid #3b4263",
  borderRadius: 6,
  color: "#8892a4",
  cursor: "pointer",
  padding: "6px 14px",
  fontSize: 13,
};
const filtersStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};
const inputStyle: React.CSSProperties = {
  background: "#1a1d27",
  border: "1px solid #2e3148",
  borderRadius: 6,
  color: "#e2e8f0",
  padding: "7px 12px",
  flex: "1 1 220px",
  minWidth: 180,
  outline: "none",
};
const selectStyle: React.CSSProperties = {
  background: "#1a1d27",
  border: "1px solid #2e3148",
  borderRadius: 6,
  color: "#e2e8f0",
  padding: "7px 28px 7px 10px",
  cursor: "pointer",
  minWidth: 140,
};
const countStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 13,
  marginLeft: "auto",
  whiteSpace: "nowrap",
};
const tableWrapStyle: React.CSSProperties = {
  border: "1px solid #2e3148",
  borderRadius: 8,
  overflow: "auto",
  minHeight: 200,
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};
const thStyle: React.CSSProperties = {
  background: "#141620",
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: "1px solid #2e3148",
  position: "sticky",
  top: 0,
  zIndex: 1,
};
const trStyle: React.CSSProperties = {
  borderBottom: "1px solid #2a2d3e",
  transition: "background 0.1s",
};
const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  verticalAlign: "top",
};
const titleBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
  width: "100%",
  display: "flex",
  gap: 6,
  alignItems: "flex-start",
};
const previewStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 12,
  marginTop: 4,
  lineHeight: 1.5,
};
const contentStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 13,
  marginTop: 8,
  lineHeight: 1.6,
  padding: "8px 12px",
  background: "#141620",
  borderRadius: 6,
  border: "1px solid #2e3148",
  whiteSpace: "pre-wrap",
  maxHeight: 300,
  overflow: "auto",
};
const linkStyle: React.CSSProperties = {
  color: "#6366f1",
  fontSize: 12,
  textDecoration: "none",
  flexShrink: 0,
  marginTop: 2,
};
const errorStyle: React.CSSProperties = {
  background: "#1f1315",
  border: "1px solid #7f1d1d",
  borderRadius: 6,
  color: "#fca5a5",
  padding: "10px 14px",
};
const loadingStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: "60px 0",
  color: "#6b7280",
};
const spinner: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "3px solid #2e3148",
  borderTopColor: "#6366f1",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
const paginationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};
const pageInputStyle: React.CSSProperties = {
  background: "#1a1d27",
  border: "1px solid #2e3148",
  borderRadius: 4,
  color: "#e2e8f0",
  padding: "3px 6px",
  width: 52,
  textAlign: "center",
  outline: "none",
};
function pageBtn(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "#141620" : "#232635",
    border: "1px solid #2e3148",
    borderRadius: 6,
    color: disabled ? "#374151" : "#9ca3af",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "6px 12px",
    fontSize: 13,
  };
}
