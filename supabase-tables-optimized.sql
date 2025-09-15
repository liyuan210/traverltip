-- =============================================
-- 江南旅游博客 - 优化后的 Supabase 数据库结构
-- =============================================

-- 启用必要的扩展
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =============================================
-- 1. 用户资料表 (优化版)
-- =============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'editor', 'admin')),
  is_active boolean default true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- 约束
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint display_name_length check (char_length(display_name) >= 1 and char_length(display_name) <= 100),
  constraint bio_length check (char_length(bio) <= 500)
);

-- 启用RLS
alter table profiles enable row level security;

-- 创建索引
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_created_at on profiles(created_at);

-- 安全策略
drop policy if exists "允许用户查看所有资料" on profiles;
drop policy if exists "允许用户更新自己的资料" on profiles;

create policy "profiles_select_policy" on profiles
  for select using (true);

create policy "profiles_update_own_policy" on profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own_policy" on profiles
  for insert with check (auth.uid() = id);

-- =============================================
-- 2. 分类表
-- =============================================
create table if not exists categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  color text default '#3B82F6',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- 约束
  constraint category_name_length check (char_length(name) >= 1 and char_length(name) <= 50),
  constraint category_slug_format check (slug ~ '^[a-z0-9-]+$')
);

-- 启用RLS
alter table categories enable row level security;

-- 创建索引
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_categories_active on categories(is_active);
create index if not exists idx_categories_sort on categories(sort_order);

-- 安全策略
create policy "categories_select_policy" on categories
  for select using (is_active = true);

create policy "categories_admin_policy" on categories
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 3. 标签表
-- =============================================
create table if not exists tags (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  color text default '#6B7280',
  usage_count integer default 0,
  created_at timestamp with time zone default now(),
  
  -- 约束
  constraint tag_name_length check (char_length(name) >= 1 and char_length(name) <= 30),
  constraint tag_slug_format check (slug ~ '^[a-z0-9-]+$')
);

-- 启用RLS
alter table tags enable row level security;

-- 创建索引
create index if not exists idx_tags_slug on tags(slug);
create index if not exists idx_tags_usage on tags(usage_count desc);
create index if not exists idx_tags_name_trgm on tags using gin(name gin_trgm_ops);

-- 安全策略
create policy "tags_select_policy" on tags
  for select using (true);

create policy "tags_admin_policy" on tags
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 4. 文章表 (优化版)
-- =============================================
create table if not exists articles (
  id serial primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  category_id integer references categories(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean default false,
  views integer default 0,
  likes integer default 0,
  reading_time integer, -- 预计阅读时间（分钟）
  seo_title text,
  seo_description text,
  author_id uuid references profiles(id) on delete cascade not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- 约束
  constraint article_title_length check (char_length(title) >= 1 and char_length(title) <= 200),
  constraint article_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint article_excerpt_length check (char_length(excerpt) <= 500),
  constraint article_seo_title_length check (char_length(seo_title) <= 60),
  constraint article_seo_description_length check (char_length(seo_description) <= 160)
);

-- 启用RLS
alter table articles enable row level security;

-- 创建索引
create index if not exists idx_articles_slug on articles(slug);
create index if not exists idx_articles_status on articles(status);
create index if not exists idx_articles_category on articles(category_id);
create index if not exists idx_articles_author on articles(author_id);
create index if not exists idx_articles_published on articles(published_at desc);
create index if not exists idx_articles_featured on articles(is_featured, published_at desc);
create index if not exists idx_articles_views on articles(views desc);
create index if not exists idx_articles_title_trgm on articles using gin(title gin_trgm_ops);
create index if not exists idx_articles_content_trgm on articles using gin(content gin_trgm_ops);

-- 安全策略
drop policy if exists "允许所有人查看已发布文章" on articles;
drop policy if exists "允许作者管理自己的文章" on articles;
drop policy if exists "允许管理员管理所有文章" on articles;

create policy "articles_select_published_policy" on articles
  for select using (status = 'published' or auth.uid() = author_id);

create policy "articles_author_policy" on articles
  for all using (auth.uid() = author_id);

create policy "articles_admin_policy" on articles
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 5. 文章标签关联表
-- =============================================
create table if not exists article_tags (
  article_id integer references articles(id) on delete cascade,
  tag_id integer references tags(id) on delete cascade,
  created_at timestamp with time zone default now(),
  
  primary key (article_id, tag_id)
);

-- 启用RLS
alter table article_tags enable row level security;

-- 创建索引
create index if not exists idx_article_tags_article on article_tags(article_id);
create index if not exists idx_article_tags_tag on article_tags(tag_id);

-- 安全策略
create policy "article_tags_select_policy" on article_tags
  for select using (
    exists (
      select 1 from articles
      where id = article_id and (status = 'published' or author_id = auth.uid())
    )
  );

create policy "article_tags_manage_policy" on article_tags
  for all using (
    exists (
      select 1 from articles
      where id = article_id and author_id = auth.uid()
    ) or exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 6. 评论表 (优化版)
-- =============================================
create table if not exists comments (
  id serial primary key,
  content text not null,
  article_id integer references articles(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade,
  parent_id integer references comments(id) on delete cascade,
  is_approved boolean default false,
  likes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- 约束
  constraint comment_content_length check (char_length(content) >= 1 and char_length(content) <= 1000)
);

-- 启用RLS
alter table comments enable row level security;

-- 创建索引
create index if not exists idx_comments_article on comments(article_id, created_at desc);
create index if not exists idx_comments_user on comments(user_id);
create index if not exists idx_comments_parent on comments(parent_id);
create index if not exists idx_comments_approved on comments(is_approved);

-- 安全策略
drop policy if exists "允许所有人查看评论" on comments;
drop policy if exists "允许用户创建评论" on comments;
drop policy if exists "允许用户删除自己的评论" on comments;
drop policy if exists "允许管理员删除所有评论" on comments;

create policy "comments_select_policy" on comments
  for select using (is_approved = true or user_id = auth.uid());

create policy "comments_insert_policy" on comments
  for insert with check (auth.uid() = user_id and auth.uid() is not null);

create policy "comments_update_own_policy" on comments
  for update using (auth.uid() = user_id);

create policy "comments_delete_own_policy" on comments
  for delete using (auth.uid() = user_id);

create policy "comments_admin_policy" on comments
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 7. 网站设置表 (优化版)
-- =============================================
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean default false,
  updated_by uuid references profiles(id),
  updated_at timestamp with time zone default now(),
  
  -- 约束
  constraint setting_key_format check (key ~ '^[a-z_]+$')
);

-- 启用RLS
alter table site_settings enable row level security;

-- 创建索引
create index if not exists idx_site_settings_public on site_settings(is_public);

-- 安全策略
create policy "site_settings_select_public_policy" on site_settings
  for select using (is_public = true);

create policy "site_settings_admin_policy" on site_settings
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =============================================
-- 8. 访问统计表 (优化版)
-- =============================================
create table if not exists analytics (
  id serial primary key,
  event_type text not null check (event_type in ('page_view', 'article_view', 'search', 'download')),
  resource_id integer, -- 文章ID或其他资源ID
  resource_type text, -- 'article', 'page', etc.
  user_id uuid references profiles(id) on delete set null,
  session_id text,
  ip_address inet,
  user_agent text,
  referrer text,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  created_at timestamp with time zone default now(),
  
  -- 约束
  constraint analytics_event_type_length check (char_length(event_type) <= 50)
);

-- 启用RLS
alter table analytics enable row level security;

-- 创建索引
create index if not exists idx_analytics_event_type on analytics(event_type);
create index if not exists idx_analytics_resource on analytics(resource_type, resource_id);
create index if not exists idx_analytics_created_at on analytics(created_at desc);
create index if not exists idx_analytics_session on analytics(session_id);
create index if not exists idx_analytics_user on analytics(user_id);

-- 安全策略
create policy "analytics_insert_policy" on analytics
  for insert with check (true);

create policy "analytics_admin_select_policy" on analytics
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =============================================
-- 9. 媒体文件表
-- =============================================
create table if not exists media (
  id serial primary key,
  filename text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  width integer,
  height integer,
  alt_text text,
  caption text,
  storage_path text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  
  -- 约束
  constraint media_filename_length check (char_length(filename) <= 255),
  constraint media_size_positive check (size_bytes > 0)
);

-- 启用RLS
alter table media enable row level security;

-- 创建索引
create index if not exists idx_media_filename on media(filename);
create index if not exists idx_media_mime_type on media(mime_type);
create index if not exists idx_media_uploaded_by on media(uploaded_by);
create index if not exists idx_media_created_at on media(created_at desc);

-- 安全策略
create policy "media_select_policy" on media
  for select using (true);

create policy "media_upload_policy" on media
  for insert with check (auth.uid() = uploaded_by);

create policy "media_admin_policy" on media
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- =============================================
-- 10. 触发器函数
-- =============================================

-- 更新 updated_at 字段
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 更新标签使用计数
create or replace function update_tag_usage_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update tags set usage_count = usage_count + 1 where id = new.tag_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update tags set usage_count = usage_count - 1 where id = old.tag_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

-- 自动设置文章发布时间
create or replace function set_article_published_at()
returns trigger as $$
begin
  if new.status = 'published' and old.status != 'published' then
    new.published_at = now();
  elsif new.status != 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

-- =============================================
-- 11. 创建触发器
-- =============================================

-- updated_at 触发器
drop trigger if exists update_profiles_updated_at on profiles;
drop trigger if exists update_articles_updated_at on articles;
drop trigger if exists update_comments_updated_at on comments;
drop trigger if exists update_categories_updated_at on categories;
drop trigger if exists update_site_settings_updated_at on site_settings;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

create trigger update_comments_updated_at
  before update on comments
  for each row execute function update_updated_at();

create trigger update_categories_updated_at
  before update on categories
  for each row execute function update_updated_at();

create trigger update_site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- 标签计数触发器
create trigger update_tag_usage_count_trigger
  after insert or delete on article_tags
  for each row execute function update_tag_usage_count();

-- 文章发布时间触发器
create trigger set_article_published_at_trigger
  before update on articles
  for each row execute function set_article_published_at();

-- =============================================
-- 12. 插入初始数据
-- =============================================

-- 默认分类
insert into categories (name, slug, description, color, sort_order) values
  ('江南古镇', 'ancient-towns', '探索江南水乡古镇的独特魅力', '#3B82F6', 1),
  ('美食文化', 'food-culture', '品味江南地区的传统美食', '#10B981', 2),
  ('园林建筑', 'gardens-architecture', '欣赏江南园林的精美建筑', '#F59E0B', 3),
  ('旅游攻略', 'travel-guides', '实用的江南旅游指南和攻略', '#EF4444', 4),
  ('文化历史', 'culture-history', '了解江南深厚的文化历史底蕴', '#8B5CF6', 5)
on conflict (slug) do nothing;

-- 默认标签
insert into tags (name, slug, color) values
  ('周庄', 'zhouzhuang', '#3B82F6'),
  ('乌镇', 'wuzhen', '#10B981'),
  ('西塘', 'xitang', '#F59E0B'),
  ('同里', 'tongli', '#EF4444'),
  ('苏州园林', 'suzhou-gardens', '#8B5CF6'),
  ('杭州西湖', 'west-lake', '#06B6D4'),
  ('江南美食', 'jiangnan-cuisine', '#84CC16'),
  ('水乡文化', 'water-town-culture', '#F97316')
on conflict (slug) do nothing;

-- 网站设置
insert into site_settings (key, value, description, is_public) values
  ('site_name', '"江南旅游博客"', '网站名称', true),
  ('site_description', '"探索江南美景，品味江南文化"', '网站描述', true),
  ('site_keywords', '["江南", "旅游", "古镇", "文化", "美食"]', '网站关键词', true),
  ('contact_email', '"contact@jiangnan-travel.com"', '联系邮箱', true),
  ('social_links', '{"weibo": "", "wechat": "", "douyin": ""}', '社交媒体链接', true),
  ('analytics_enabled', 'true', '是否启用分析', false),
  ('comments_enabled', 'true', '是否启用评论', true),
  ('registration_enabled', 'true', '是否允许用户注册', false)
on conflict (key) do nothing;

-- =============================================
-- 13. 创建视图
-- =============================================

-- 文章统计视图
create or replace view article_stats as
select 
  a.id,
  a.title,
  a.slug,
  a.views,
  a.likes,
  a.status,
  a.published_at,
  p.display_name as author_name,
  c.name as category_name,
  coalesce(comment_count.count, 0) as comment_count,
  array_agg(t.name order by t.name) filter (where t.name is not null) as tags
from articles a
left join profiles p on a.author_id = p.id
left join categories c on a.category_id = c.id
left join article_tags at on a.id = at.article_id
left join tags t on at.tag_id = t.id
left join (
  select article_id, count(*) as count
  from comments
  where is_approved = true
  group by article_id
) comment_count on a.id = comment_count.article_id
group by a.id, a.title, a.slug, a.views, a.likes, a.status, a.published_at, 
         p.display_name, c.name, comment_count.count;

-- 热门文章视图
create or replace view popular_articles as
select *
from article_stats
where status = 'published'
order by views desc, likes desc
limit 10;

-- 最新文章视图
create or replace view recent_articles as
select *
from article_stats
where status = 'published'
order by published_at desc
limit 10;