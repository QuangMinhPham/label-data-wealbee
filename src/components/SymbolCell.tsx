"use client";

import { useState, useRef, useEffect } from "react";
import { MACRO_SYMBOLS } from "@/lib/supabase";

interface Props {
  id: string;
  value: string | null;
  onSave: (id: string, symbol: string | null) => Promise<void>;
}

export default function SymbolCell({ id, value, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustom = selected === "__custom__";

  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  async function handleSave() {
    const final = isCustom ? custom.trim() : selected || null;
    setSaving(true);
    try {
      await onSave(id, final || null);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} style={btnStyle}>
        {value ? (
          <span style={chipStyle}>{value}</span>
        ) : (
          <span style={emptyStyle}>—</span>
        )}
      </button>
    );
  }

  return (
    <div style={popupStyle} onKeyDown={handleKeyDown}>
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setCustom("");
        }}
        style={selectStyle}
        autoFocus={!isCustom}
      >
        <option value="">— Trống —</option>
        {MACRO_SYMBOLS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value="__custom__">✏️ Nhập tay...</option>
      </select>

      {isCustom && (
        <input
          ref={inputRef}
          value={custom}
          onChange={(e) => setCustom(e.target.value.toUpperCase())}
          placeholder="Nhập symbol..."
          style={inputStyle}
        />
      )}

      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? "..." : "Lưu"}
        </button>
        <button onClick={() => setEditing(false)} style={cancelBtnStyle}>
          Hủy
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "1px dashed transparent",
  borderRadius: 4,
  cursor: "pointer",
  padding: "2px 4px",
  textAlign: "left",
  minWidth: 60,
};
const chipStyle: React.CSSProperties = {
  background: "#232635",
  border: "1px solid #3b4263",
  borderRadius: 4,
  padding: "1px 8px",
  color: "#a78bfa",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
};
const emptyStyle: React.CSSProperties = {
  color: "#4b5563",
  fontSize: 13,
};
const popupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  background: "#1e2235",
  border: "1px solid #3b4263",
  borderRadius: 8,
  padding: 10,
  minWidth: 160,
  zIndex: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
};
const selectStyle: React.CSSProperties = {
  background: "#232635",
  border: "1px solid #3b4263",
  borderRadius: 4,
  color: "#e2e8f0",
  padding: "5px 24px 5px 8px",
  width: "100%",
  cursor: "pointer",
};
const inputStyle: React.CSSProperties = {
  background: "#232635",
  border: "1px solid #6366f1",
  borderRadius: 4,
  color: "#e2e8f0",
  padding: "5px 8px",
  width: "100%",
  outline: "none",
};
const saveBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#6366f1",
  border: "none",
  borderRadius: 4,
  color: "#fff",
  cursor: "pointer",
  padding: "4px 8px",
  fontWeight: 600,
};
const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#2e3148",
  border: "none",
  borderRadius: 4,
  color: "#8892a4",
  cursor: "pointer",
  padding: "4px 8px",
};
