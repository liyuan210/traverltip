-- 创建用户资料表
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'user',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用RLS (行级安全)
alter table profiles enable row level security;

-- 创建安全策略
create policy "允许用户查看所有资料" on profiles
  for select using (true);

create policy "允许用户更新自己的资料" on profiles
  for update using (auth.uid() = id);

-- 创建文章表
create table articles (
  id serial primary key,
  title text not null,
  content text,
  category text,
  status text default 'draft',
  views integer default 0,
  author_id uuid references profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用RLS
alter table articles enable row level security;

-- 创建安全策略
create policy "允许所有人查看已发布文章" on articles
  for select using (status = 'published');

create policy "允许作者管理自己的文章" on articles
  for all using (auth.uid() = author_id);

create policy "允许管理员管理所有文章" on articles
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 创建评论表
create table comments (
  id serial primary key,
  content text not null,
  article_id integer references articles(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- 启用RLS
alter table comments enable row level security;

-- 创建安全策略
create policy "允许所有人查看评论" on comments
  for select using (true);

create policy "允许用户创建评论" on comments
  for insert with check (auth.uid() = user_id);

create policy "允许用户删除自己的评论" on comments
  for delete using (auth.uid() = user_id);

create policy "允许管理员删除所有评论" on comments
  for delete using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 创建设置表
create table settings (
  id integer primary key default 1,
  site_name text default '江南旅游博客',
  site_description text default '探索江南美景，品味江南文化',
  contact_email text,
  updated_by uuid references profiles(id),
  updated_at timestamp with time zone default now()
);

-- 启用RLS
alter table settings enable row level security;

-- 创建安全策略
create policy "允许所有人查看设置" on settings
  for select using (true);

create policy "允许管理员更新设置" on settings
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 创建访问统计表
create table visits (
  id serial primary key,
  date date default current_date,
  count integer default 1,
  created_at timestamp with time zone default now()
);

-- 启用RLS
alter table visits enable row level security;

-- 创建安全策略
create policy "允许所有人查看访问统计" on visits
  for select using (true);

create policy "允许系统更新访问统计" on visits
  for insert with check (true);

create policy "允许系统更新访问统计" on visits
  for update using (true);

-- 创建触发器函数，自动更新updated_at字段
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 为表添加更新触发器
create trigger update_profiles_updated_at
before update on profiles
for each row execute procedure update_updated_at();

create trigger update_articles_updated_at
before update on articles
for each row execute procedure update_updated_at();