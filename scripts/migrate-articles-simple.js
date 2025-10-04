// 简化版文章迁移脚本
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 从环境变量读取Supabase配置
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://hqpcnflogdhcqddipaso.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcGNuZmxvZ2RoY3FkZGlwYXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NjQ4NDIsImV4cCI6MjA0OTA0MDg0Mn0.0DjqFQHdnYjBUJXjCdlBVRKXLPqCzJOLRLfzTlBgvnI';

console.log('🔗 使用配置:', { url: supabaseUrl, keyPrefix: supabaseKey.substring(0, 20) + '...' });

const supabase = createClient(supabaseUrl, supabaseKey);

// 文章数据映射
const articlesData = [
  {
    title: '上海杭州商务休闲之旅：工作与度假的完美平衡',
    title_en: 'Shanghai-Hangzhou Business & Leisure Journey',
    slug: 'shanghai-hangzhou-tour',
    category: '行程规划',
    city: '上海,杭州',
    excerpt: '从美国到上海再到杭州的完整旅游攻略，包含商务工作与休闲度假的完美结合，详细的交通、住宿、美食推荐。',
    content: '这是一次完美结合商务与休闲的旅程。从美国出发，经过上海的繁华都市体验，再到杭州的江南水乡风情，整个行程安排紧凑而充实。上海作为国际大都市，不仅有现代化的商务环境，更有丰富的文化底蕴和美食体验。而杭州的西湖美景、千岛湖风光，为这次商务旅行增添了诗意的色彩。',
    featured_image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    published: true,
    featured: true
  },
  {
    title: '杭州宁波4晚5天深度游：西湖到天一阁的完美江南之旅',
    slug: 'hangzhou-ningbo-tour',
    category: '行程规划',
    city: '杭州,宁波',
    excerpt: '详细的杭州宁波4晚5天旅游攻略，从西湖美景到天一阁藏书楼，完整的交通、住宿、美食、景点推荐。',
    content: '杭州和宁波是江南地区最具代表性的两座城市。杭州以西湖闻名天下，宁波则以深厚的商业文化和历史底蕴著称。这条4晚5天的路线，将带您领略从古典园林到现代都市的完美过渡，体验江南水乡的独特魅力。',
    featured_image: 'https://s.coze.cn/image/laRk9ry12X4/',
    published: true,
    featured: false
  },
  {
    title: '西湖一日闲游：从晨光到暮色的环湖漫记',
    title_en: 'West Lake Day Tour: From Dawn to Dusk',
    slug: 'xihu-tour',
    category: '景点游览',
    city: '杭州',
    excerpt: '跟随我们的脚步，体验西湖从晨光到暮色的一日游，感受这座千年古湖的诗意与浪漫。',
    content: '西湖，这座承载着千年文化的古湖，每一个时刻都有着不同的美。从晨光熹微的断桥残雪，到夕阳西下的雷峰夕照，一天的时光足以让您领略西湖的万种风情。苏堤春晓、曲院风荷、三潭印月，每一处景致都有着深厚的文化内涵。',
    featured_image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    published: true,
    featured: false
  },
  {
    title: 'Yiwu Two-Day Tour: Small Commodities & International Culture',
    slug: 'yiwu-tour',
    category: 'Attractions',
    city: 'Yiwu',
    excerpt: 'Explore Yiwu, the "World\'s Supermarket" known for hosting the largest small commodity wholesale market on the planet.',
    content: 'Yiwu International Trade City is a marvel of modern commerce, spanning over 5 million square meters and housing more than 75,000 booths. This two-day itinerary will guide you through the bustling markets, cultural sites, and local experiences that make Yiwu a unique destination for both business and leisure travelers.',
    featured_image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    published: true,
    featured: false
  },
  {
    title: '绍兴2天深度游全攻略：跟着课本游江南',
    slug: 'shaoxing-travel-guide',
    category: '文化体验',
    city: '绍兴',
    excerpt: '从鲁迅故里到兰亭圣地，从沈园绝唱到东湖奇景，两天时间深度体验绍兴的文化魅力与水乡风情。',
    content: '绍兴，这座有着2500年历史的文化古城，孕育了无数文人墨客。从鲁迅的《从百草园到三味书屋》到王羲之的《兰亭集序》，从陆游与唐婉的爱情悲歌到东湖的奇石秀水，绍兴的每一处风景都承载着深厚的文化底蕴。',
    featured_image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    published: true,
    featured: false
  }
];

async function migrateArticles() {
  console.log('🚀 开始迁移文章数据...');
  
  try {
    // 测试数据库连接
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError);
      return;
    }
    
    console.log('✅ 数据库连接成功');
    
    // 插入文章数据
    for (const article of articlesData) {
      console.log(`📝 正在插入文章: ${article.title}`);
      
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select();
      
      if (error) {
        if (error.code === '23505') { // 唯一约束冲突
          console.log(`⚠️ 文章已存在，跳过: ${article.title}`);
        } else {
          console.error(`❌ 插入失败: ${article.title}`, error);
        }
      } else {
        console.log(`✅ 插入成功: ${article.title}`);
      }
    }
    
    // 查询插入结果
    const { data: allArticles, error: queryError } = await supabase
      .from('articles')
      .select('id, title, slug, published, created_at')
      .order('created_at', { ascending: false });
    
    if (queryError) {
      console.error('❌ 查询文章失败:', queryError);
    } else {
      console.log(`\n📊 数据迁移完成！共有 ${allArticles.length} 篇文章:`);
      allArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.published ? '已发布' : '草稿'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
  }
}

// 执行迁移
migrateArticles();