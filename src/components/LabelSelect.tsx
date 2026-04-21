"use client";

import { useState } from "react";
import { LABEL_OPTIONS, Label } from "@/lib/supabase";

interface Props {
  id: string;
  value: Label;
  onSave: (id: string, label: Label) => Promise<void>;
}

const LABEL_COLORS: Record<string, string> = {
  positive: "#16a34a",
  neutral: "#2563eb",
  negative: "#dc2626",
  trash: "#d97706",
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

  const color = value ? LABEL_COLORS[value] : "#4b5563";

  return (
    <select
      value={value ?? ""}
      onChange={handleChange}
      disabled={saving}
      style={{
        background: value ? `${color}22` : "#1e2235",
        border: `1.5px solid ${color}`,
        borderRadius: 6,
        color: value ? color : "#6b7280",
        padding: "4px 24px 4px 8px",
        cursor: "pointer",
        fontWeight: 600,
        minWidth: 120,
        opacity: saving ? 0.6 : 1,
        transition: "all 0.15s",
      }}
    >
      {LABEL_OPTIONS.map((opt) => (
        <option key={opt.value ?? "null"} value={opt.value ?? ""}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
