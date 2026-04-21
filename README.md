# Wealbee Data Labeling Tool

Giao diện gán nhãn dữ liệu tin tức thị trường từ Supabase.

## Setup

```bash
cd labeling-tool
npm install
cp .env.local.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Deploy Vercel

1. Push folder `labeling-tool` lên GitHub repo riêng (hoặc monorepo)
2. Import vào Vercel, chọn **Root Directory** = `labeling-tool`
3. Thêm Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Trước khi dùng

Chạy migration SQL trên Supabase:

```sql
-- File: supabase/migrations/20260421000000_add_label_to_market_news.sql
ALTER TABLE market_news
  ADD COLUMN IF NOT EXISTS label TEXT CHECK (label IN ('positive', 'neutral', 'negative', 'trash')),
  ADD COLUMN IF NOT EXISTS labeled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS labeled_by TEXT;

CREATE POLICY "Allow label update market_news"
  ON market_news FOR UPDATE USING (true) WITH CHECK (true);

GRANT UPDATE (label, labeled_at, labeled_by, symbol) ON market_news TO anon, authenticated;
```
