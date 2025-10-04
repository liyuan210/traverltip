-- Travel Website Database Schema
-- Execute these commands in Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create articles table
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
    tags TEXT[],
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    value_en TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create page views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_city ON articles(city);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);

-- 6. Insert default categories
INSERT INTO categories (name, name_en, slug, description) VALUES
('美食攻略', 'Food Guide', 'food', 'Local food recommendations and restaurant guides'),
('景点游览', 'Attractions', 'attractions', 'Popular attractions and sightseeing guides'),
('住宿推荐', 'Accommodation', 'hotels', 'Hotel and accommodation recommendations'),
('交通指南', 'Transportation', 'transport', 'Transportation options and route planning'),
('购物娱乐', 'Shopping', 'shopping', 'Shopping centers and entertainment venues'),
('文化体验', 'Culture', 'culture', 'Local culture and historical experiences'),
('行程规划', 'Itinerary', 'itinerary', 'Complete travel itinerary planning')
ON CONFLICT (slug) DO NOTHING;

-- 7. Insert default settings
INSERT INTO settings (key, value, value_en, description, type) VALUES
('site_title', '江南旅游攻略', 'Jiangnan Travel Guide', 'Website title', 'text'),
('site_description', '专业的江南地区旅游攻略，包含杭州、苏州、乌镇等热门目的地', 'Professional travel guide for Jiangnan region including Hangzhou, Suzhou, Wuzhen and more', 'Website description', 'text'),
('contact_email', 'info@traveltip.com', 'info@traveltip.com', 'Contact email', 'text'),
('posts_per_page', '12', '12', 'Posts per page', 'number'),
('enable_comments', 'true', 'true', 'Enable comments', 'boolean'),
('google_analytics_id', '', '', 'Google Analytics ID', 'text')
ON CONFLICT (key) DO NOTHING;

-- 8. Create update timestamp trigger
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

-- 9. Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Allow public read access to published articles" ON articles
    FOR SELECT USING (published = true);

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings" ON settings
    FOR SELECT USING (true);

-- Allow public insert to page views
CREATE POLICY "Allow public insert to page_views" ON page_views
    FOR INSERT WITH CHECK (true);

-- Database schema creation completed successfully