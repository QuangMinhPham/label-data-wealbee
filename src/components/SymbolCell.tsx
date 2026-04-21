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
    if (isCustom) inputRef.current?.focus();
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

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} style={triggerStyle} title="Click để sửa symbol">
        {value
          ? <span style={chipStyle}>{value}</span>
          : <span style={emptyStyle}>+ Thêm</span>
        }
      </button>
    );
  }

  return (
    <div style={popupStyle}>
      <p style={popupLabel}>Chọn symbol</p>
      <select
        value={selected}
        onChange={(e) => { setSelected(e.target.value); setCustom(""); }}
        style={selectStyle}
        autoFocus={!isCustom}
      >
        <option value="">— Xóa symbol —</option>
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
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          placeholder="Ví dụ: HPG, VNM..."
          style={inputStyle}
        />
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button onClick={() => setEditing(false)} style={cancelBtnStyle}>Hủy</button>
      </div>
    </div>
  );
}

const triggerStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "2px 0",
  textAlign: "left",
};
const chipStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eef1fe",
  border: "1px solid #c7d2fc",
  borderRadius: 6,
  padding: "3px 10px",
  color: "#4f6ef7",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
};
const emptyStyle: React.CSSProperties = {
  display: "inline-block",
  color: "#9aa5b4",
  fontSize: 12,
  border: "1px dashed #cbd2da",
  borderRadius: 6,
  padding: "3px 8px",
};
const popupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  background: "#fff",
  border: "1px solid #e2e6ed",
  borderRadius: 10,
  padding: 12,
  minWidth: 180,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  zIndex: 10,
};
const popupLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7a90",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const selectStyle: React.CSSProperties = {
  background: "#f5f7fa",
  border: "1px solid #e2e6ed",
  borderRadius: 7,
  color: "#1a2130",
  padding: "7px 28px 7px 10px",
  width: "100%",
  cursor: "pointer",
  outline: "none",
};
const inputStyle: React.CSSProperties = {
  background: "#fff",
  border: "1.5px solid #4f6ef7",
  borderRadius: 7,
  color: "#1a2130",
  padding: "7px 10px",
  width: "100%",
  outline: "none",
  fontWeight: 600,
};
const saveBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#4f6ef7",
  border: "none",
  borderRadius: 7,
  color: "#fff",
  cursor: "pointer",
  padding: "7px 0",
  fontWeight: 600,
};
const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#f0f2f5",
  border: "1px solid #e2e6ed",
  borderRadius: 7,
  color: "#6b7a90",
  cursor: "pointer",
  padding: "7px 0",
  fontWeight: 500,
};
