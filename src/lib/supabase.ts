import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Label = "positive" | "neutral" | "negative" | "trash" | null;

export interface NewsRow {
  id: string;
  symbol: string | null;
  title: string;
  content: string | null;
  author: string | null;
  source: string | null;
  close_price: number | null;
  price_change: number | null;
  price_change_pct: number | null;
  article_url: string | null;
  published_at: string | null;
  created_at: string | null;
  label: Label;
  labeled_at: string | null;
  labeled_by: string | null;
}

export const LABEL_OPTIONS: { value: Label; label: string; color: string }[] = [
  { value: null, label: "— Chưa gán —", color: "#9ca3af" },
  { value: "positive", label: "✅ Positive", color: "#16a34a" },
  { value: "neutral", label: "➖ Neutral", color: "#2563eb" },
  { value: "negative", label: "❌ Negative", color: "#dc2626" },
  { value: "trash", label: "🗑 Trash", color: "#78350f" },
];

// Danh sách symbol vĩ mô cố định
export const MACRO_SYMBOLS = [
  "VĨ MÔ",
  "VNINDEX",
  "HNX",
  "UPCOM",
  "USD/VND",
  "GOLD",
  "OIL",
  "LÃISUẤT",
  "TRÁIPHIẾU",
  "BĐS",
  "CRYPTO",
];

export const PAGE_SIZE = 20;

export async function fetchNews(params: {
  page: number;
  labelFilter: string;
  symbolFilter: string;
  search: string;
}): Promise<{ data: NewsRow[]; count: number }> {
  const { page, labelFilter, symbolFilter, search } = params;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("market_news")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (labelFilter === "unlabeled") {
    query = query.is("label", null);
  } else if (labelFilter && labelFilter !== "all") {
    query = query.eq("label", labelFilter);
  }

  if (symbolFilter && symbolFilter !== "all") {
    if (symbolFilter === "no_symbol") {
      query = query.is("symbol", null);
    } else {
      query = query.eq("symbol", symbolFilter);
    }
  }

  if (search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as NewsRow[]) ?? [], count: count ?? 0 };
}

export async function updateNewsRow(
  id: string,
  updates: { label?: Label; symbol?: string | null }
) {
  const { error } = await supabase
    .from("market_news")
    .update({ ...updates, labeled_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchLabelStats(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("market_news")
    .select("label");
  if (error) throw error;
  const stats: Record<string, number> = {
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    trash: 0,
    unlabeled: 0,
  };
  for (const row of data as { label: string | null }[]) {
    stats.total++;
    if (row.label) stats[row.label] = (stats[row.label] ?? 0) + 1;
    else stats.unlabeled++;
  }
  return stats;
}
