-- 临时禁用RLS以便数据迁移
-- 在Supabase SQL编辑器中执行

-- 禁用RLS
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- 验证RLS状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'articles';