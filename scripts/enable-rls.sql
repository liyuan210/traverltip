-- 重新启用RLS（数据迁移完成后执行）
-- 在Supabase SQL编辑器中执行

-- 启用RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 创建更宽松的策略用于管理
DROP POLICY IF EXISTS "Allow public read access to published articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to manage articles" ON articles;

-- 允许所有人读取已发布的文章
CREATE POLICY "Allow public read access to published articles" ON articles
    FOR SELECT USING (published = true);

-- 允许所有人插入文章（用于迁移，后续可以调整）
CREATE POLICY "Allow public insert articles" ON articles
    FOR INSERT WITH CHECK (true);

-- 允许所有人更新文章（用于管理，后续可以调整）
CREATE POLICY "Allow public update articles" ON articles
    FOR UPDATE USING (true);

-- 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'articles';