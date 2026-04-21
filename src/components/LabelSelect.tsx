"use client";

import { useState } from "react";
import { LABEL_OPTIONS, Label } from "@/lib/supabase";

interface Props {
  id: string;
  value: Label;
  onSave: (id: string, label: Label) => Promise<void>;
}

const CONFIGS: Record<string, { color: string; bg: string; border: string; text: string }> = {
  positive: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", text: "✅ Positive" },
  neutral:  { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", text: "➖ Neutral"  },
  negative: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", text: "❌ Negative" },
  trash:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a", text: "🗑 Trash"    },
};

export default function LabelSelect({ id, value, onSave }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = (e.target.value || null) as Label;
    setSaving(true);
    try {
      await onSave(id, next);
    } finally {
      setSaving(false);
    }
  }

  const cfg = value ? CONFIGS[value] : null;

  return (
    <select
      value={value ?? ""}
      onChange={handleChange}
      disabled={saving}
      style={{
        background: cfg ? cfg.bg : "#f9fafb",
        border: `1.5px solid ${cfg ? cfg.border : "#e2e6ed"}`,
        borderRadius: 8,
        color: cfg ? cfg.color : "#9aa5b4",
        padding: "6px 28px 6px 10px",
        cursor: saving ? "wait" : "pointer",
        fontWeight: 600,
        fontSize: 13,
        width: "100%",
        minWidth: 130,
        opacity: saving ? 0.7 : 1,
        transition: "all 0.15s",
        outline: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <option value="">— Chưa gán —</option>
      {LABEL_OPTIONS.filter((o) => o.value).map((opt) => (
        <option key={opt.value} value={opt.value!}>{opt.label}</option>
      ))}
    </select>
  );
}
