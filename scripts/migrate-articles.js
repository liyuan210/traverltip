// 将现有HTML文章迁移到Supabase数据库
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { supabase } from '../config/supabase.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// 设置DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

console.log('🚀 开始迁移文章到Supabase数据库...\n');

// 文章映射配置
const articleMappings = [
  {
    file: 'hangzhou-food.html',
    title: '杭州美食攻略：品味西湖边的江南味道',
    title_en: 'Hangzhou Food Guide: Taste the Jiangnan Flavors by West Lake',
    slug: 'hangzhou-food-guide',
    category: '美食攻略',
    city: '杭州',
    featured: true
  },
  {
    file: 'suzhou-gardens.html', 
    title: '苏州园林深度游：走进古典园林的诗意世界',
    title_en: 'Suzhou Gardens Deep Tour: Enter the Poetic World of Classical Gardens',
    slug: 'suzhou-gardens-tour',
    category: '景点游览',
    city: '苏州',
    featured: true
  },
  {
    file: 'xihu-tour.html',
    title: '西湖一日游完整攻略：感受杭州的诗意之美',
    title_en: 'West Lake One-Day Tour Complete Guide: Feel the Poetic Beauty of Hangzhou',
    slug: 'west-lake-one-day-tour',
    category: '景点游览', 
    city: '杭州',
    featured: true
  },
  {
    file: 'wuzhen-tour_en.html',
    title: '乌镇古镇游览指南：体验江南水乡的千年韵味',
    title_en: 'Wuzhen Ancient Town Travel Guide: Experience the Millennium Charm of Jiangnan Water Town',
    slug: 'wuzhen-ancient-town-guide',
    category: '景点游览',
    city: '乌镇',
    featured: true
  },
  {
    file: 'shaoxing-tour.html',
    title: '绍兴古城文化之旅：探寻鲁迅故里的历史印记',
    title_en: 'Shaoxing Ancient City Cultural Tour: Explore the Historical Traces of Lu Xun\'s Hometown',
    slug: 'shaoxing-cultural-tour',
    category: '文化体验',
    city: '绍兴',
    featured: false
  },
  {
    file: 'jiaxing-travel-guide.html',
    title: '嘉兴旅游攻略：南湖红船与江南古韵',
    title_en: 'Jiaxing Travel Guide: South Lake Red Boat and Jiangnan Ancient Charm',
    slug: 'jiaxing-travel-guide',
    category: '行程规划',
    city: '嘉兴',
    featured: false
  },
  {
    file: 'ningbo-3day-guide_en.html',
    title: '宁波三日游攻略：港城风情与天一阁书香',
    title_en: 'Ningbo 3-Day Guide: Port City Charm and Tianyi Pavilion Scholarly Atmosphere',
    slug: 'ningbo-3day-guide',
    category: '行程规划',
    city: '宁波',
    featured: false
  },
  {
    file: 'yiwu-bilingual-tour.html',
    title: '义乌两日游攻略：世界小商品之都的国际风情',
    title_en: 'Yiwu Two-Day Complete Guide: World\'s Largest Small Commodity Market & International Culture',
    slug: 'yiwu-international-tour',
    category: '购物娱乐',
    city: '义乌',
    featured: false
  }
];

// 从HTML文件提取内容的函数
function extractContentFromHTML(htmlContent) {
  // 移除HTML标签，保留文本内容
  const textContent = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return textContent;
}

// 生成文章摘要
function generateExcerpt(content, maxLength = 200) {
  const cleanContent = content.replace(/\s+/g, ' ').trim();
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  return cleanContent.substring(0, maxLength) + '...';
}

// 生成SEO友好的slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

async function migrateArticles() {
  const articlesDir = './articles';
  const migratedArticles = [];

  for (const mapping of articleMappings) {
    try {
      const filePath = join(articlesDir, mapping.file);
      console.log(`📄 处理文章: ${mapping.file}`);
      
      // 检查文件是否存在
      let htmlContent;
      try {
        htmlContent = readFileSync(filePath, 'utf-8');
      } catch (error) {
        console.log(`⚠️  文件不存在，跳过: ${mapping.file}`);
        continue;
      }

      // 提取内容
      const content = extractContentFromHTML(htmlContent);
      const excerpt = generateExcerpt(content);
      
      // 生成图片路径
      const featuredImage = `../images/${mapping.city.toLowerCase()}-${mapping.category === '美食攻略' ? 'food' : 'attraction'}.svg`;
      
      // 准备文章数据
      const articleData = {
        title: mapping.title,
        title_en: mapping.title_en,
        slug: mapping.slug,
        content: content,
        content_en: mapping.title_en ? content : null, // 如果有英文标题，假设内容也是双语的
        excerpt: excerpt,
        excerpt_en: mapping.title_en ? generateExcerpt(content) : null,
        category: mapping.category,
        city: mapping.city,
        featured_image: featuredImage,
        image_alt: `${mapping.city}${mapping.category}`,
        meta_title: mapping.title,
        meta_title_en: mapping.title_en,
        meta_description: excerpt,
        meta_description_en: mapping.title_en ? excerpt : null,
        tags: [mapping.city, mapping.category, '江南', '旅游'],
        published: true,
        featured: mapping.featured,
        view_count: Math.floor(Math.random() * 1000) + 100 // 随机初始浏览量
      };

      // 插入到数据库
      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select();

      if (error) {
        console.error(`❌ 插入文章失败 ${mapping.file}:`, error.message);
        continue;
      }

      migratedArticles.push(data[0]);
      console.log(`✅ 成功迁移: ${mapping.title}`);
      
    } catch (error) {
      console.error(`❌ 处理文章时出错 ${mapping.file}:`, error.message);
    }
  }

  return migratedArticles;
}

// 主函数
async function main() {
  try {
    console.log('🔗 连接到Supabase数据库...');
    
    // 测试数据库连接
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      throw new Error(`数据库连接失败: ${testError.message}`);
    }
    
    console.log('✅ 数据库连接成功！\n');
    
    // 开始迁移
    const migratedArticles = await migrateArticles();
    
    console.log('\n🎉 文章迁移完成！');
    console.log(`📊 成功迁移 ${migratedArticles.length} 篇文章`);
    
    if (migratedArticles.length > 0) {
      console.log('\n📋 迁移的文章列表：');
      migratedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.city})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 迁移过程中出错:', error.message);
    process.exit(1);
  }
}

// 执行迁移
main();