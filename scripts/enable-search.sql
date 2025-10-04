-- 可选：启用高级搜索功能
-- 如果基础建表成功后需要更好的搜索功能，可以执行此脚本

-- 1. 启用 pg_trgm 扩展（用于模糊搜索）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 创建三元组索引（支持模糊搜索）
CREATE INDEX IF NOT EXISTS idx_articles_title_trgm ON articles USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_articles_content_trgm ON articles USING gin(content gin_trgm_ops);

-- 3. 创建复合搜索索引
CREATE INDEX IF NOT EXISTS idx_articles_search_compound ON articles USING gin(
    (title || ' ' || content || ' ' || COALESCE(city, '') || ' ' || COALESCE(category, '')) gin_trgm_ops
);

-- 4. 尝试创建全文搜索索引（如果支持的话）
DO $$
BEGIN
    -- 尝试创建中文全文搜索索引
    BEGIN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_articles_fts_zh ON articles USING gin(to_tsvector(''chinese'', title || '' '' || content))';
    EXCEPTION WHEN OTHERS THEN
        -- 如果不支持中文配置，使用简单配置
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_articles_fts_simple ON articles USING gin(to_tsvector(''simple'', title || '' '' || content))';
    END;
    
    -- 英文全文搜索索引
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_articles_fts_en ON articles USING gin(to_tsvector(''english'', COALESCE(title_en, '''') || '' '' || COALESCE(content_en, '''')))';
END
$$;

-- 5. 创建搜索辅助函数
CREATE OR REPLACE FUNCTION search_articles(
    search_query TEXT,
    search_language TEXT DEFAULT 'simple'
) RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    slug VARCHAR(255),
    excerpt TEXT,
    category VARCHAR(50),
    city VARCHAR(50),
    featured_image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.excerpt,
        a.category,
        a.city,
        a.featured_image,
        a.created_at,
        GREATEST(
            similarity(a.title, search_query),
            similarity(a.content, search_query) * 0.5,
            similarity(COALESCE(a.city, ''), search_query) * 0.8,
            similarity(COALESCE(a.category, ''), search_query) * 0.7
        ) as similarity_score
    FROM articles a
    WHERE 
        a.published = true
        AND (
            a.title ILIKE '%' || search_query || '%'
            OR a.content ILIKE '%' || search_query || '%'
            OR a.city ILIKE '%' || search_query || '%'
            OR a.category ILIKE '%' || search_query || '%'
            OR similarity(a.title, search_query) > 0.1
            OR similarity(a.content, search_query) > 0.05
        )
    ORDER BY similarity_score DESC, a.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- 完成！高级搜索功能已启用