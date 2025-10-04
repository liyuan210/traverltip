-- 创建旅游网站数据库表结构
-- 请在Supabase SQL编辑器中执行这些命令

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建文章表
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    content_en TEXT,
    excerpt TEXT,
    excerpt_en TEXT,
    category VARCHAR(50),
    city VARCHAR(50),
    featured_image VARCHAR(500),
    image_alt VARCHAR(255),
    meta_title VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_description TEXT,
    meta_description_en TEXT,
    tags TEXT[], -- PostgreSQL数组类型
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建设置表
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    value_en TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text', -- text, number, boolean, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建页面浏览统计表（可选）
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_city ON articles(city);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- 创建全文搜索索引（使用通用配置，兼容性更好）
CREATE INDEX IF NOT EXISTS idx_articles_search_zh ON articles USING gin(to_tsvector('simple', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_articles_search_en ON articles USING gin(to_tsvector('english', COALESCE(title_en, '') || ' ' || COALESCE(content_en, '')));

-- 如果需要更好的中文搜索支持，可以尝试以下索引（可选）
-- CREATE INDEX IF NOT EXISTS idx_articles_title_gin ON articles USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_articles_content_gin ON articles USING gin(content gin_trgm_ops);

-- 6. 插入默认分类数据
INSERT INTO categories (name, name_en, slug, description) VALUES
('美食攻略', 'Food Guide', 'food', '各地特色美食推荐和餐厅指南'),
('景点游览', 'Attractions', 'attractions', '热门景点介绍和游览攻略'),
('住宿推荐', 'Accommodation', 'hotels', '酒店和民宿推荐'),
('交通指南', 'Transportation', 'transport', '交通方式和路线规划'),
('购物娱乐', 'Shopping', 'shopping', '购物中心和娱乐场所推荐'),
('文化体验', 'Culture', 'culture', '当地文化和历史体验'),
('行程规划', 'Itinerary', 'itinerary', '完整的旅行行程安排')
ON CONFLICT (slug) DO NOTHING;

-- 7. 插入默认设置
INSERT INTO settings (key, value, value_en, description, type) VALUES
('site_title', '江南旅游攻略', 'Jiangnan Travel Guide', '网站标题', 'text'),
('site_description', '专业的江南地区旅游攻略，包含杭州、苏州、乌镇等热门目的地', 'Professional travel guide for Jiangnan region including Hangzhou, Suzhou, Wuzhen and more', '网站描述', 'text'),
('contact_email', 'info@traveltip.com', 'info@traveltip.com', '联系邮箱', 'text'),
('posts_per_page', '12', '12', '每页文章数量', 'number'),
('enable_comments', 'true', 'true', '启用评论功能', 'boolean'),
('google_analytics_id', '', '', 'Google Analytics ID', 'text')
ON CONFLICT (key) DO NOTHING;

-- 8. 创建RLS (Row Level Security) 策略
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取已发布的文章
CREATE POLICY "Allow public read access to published articles" ON articles
    FOR SELECT USING (published = true);

-- 允许所有人读取分类
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

-- 允许所有人读取设置
CREATE POLICY "Allow public read access to settings" ON settings
    FOR SELECT USING (true);

-- 只允许认证用户管理文章（需要后续配置管理员角色）
CREATE POLICY "Allow authenticated users to manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！数据库表结构创建完毕