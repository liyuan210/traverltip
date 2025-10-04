-- Verify database tables creation
-- Run this after creating tables to check everything is working

-- 1. Check all created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('articles', 'categories', 'settings', 'page_views')
ORDER BY table_name;

-- 2. Check articles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- 3. Check categories data
SELECT name, name_en, slug FROM categories ORDER BY name;

-- 4. Check settings data
SELECT key, value, value_en FROM settings ORDER BY key;

-- 5. Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('articles', 'categories', 'settings', 'page_views')
ORDER BY tablename, indexname;

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('articles', 'categories', 'settings', 'page_views')
ORDER BY tablename, policyname;

-- 7. Test insert (optional - remove if not needed)
-- INSERT INTO articles (title, slug, content, category, city, published) 
-- VALUES ('Test Article', 'test-article', 'This is a test article content.', '景点游览', '杭州', true)
-- ON CONFLICT (slug) DO NOTHING;

-- 8. Test select
SELECT id, title, slug, category, city, published, created_at 
FROM articles 
WHERE published = true 
ORDER BY created_at DESC 
LIMIT 5;