-- 直接在Supabase SQL编辑器中执行此脚本来插入文章数据
-- 这样可以绕过RLS限制

-- 插入文章数据
INSERT INTO articles (
    title, title_en, slug, category, city, excerpt, content, 
    featured_image, published, featured, view_count
) VALUES 
(
    '上海杭州商务休闲之旅：工作与度假的完美平衡',
    'Shanghai-Hangzhou Business & Leisure Journey',
    'shanghai-hangzhou-tour',
    '行程规划',
    '上海,杭州',
    '从美国到上海再到杭州的完整旅游攻略，包含商务工作与休闲度假的完美结合，详细的交通、住宿、美食推荐。',
    '这是一次完美结合商务与休闲的旅程。从美国出发，经过上海的繁华都市体验，再到杭州的江南水乡风情，整个行程安排紧凑而充实。上海作为国际大都市，不仅有现代化的商务环境，更有丰富的文化底蕴和美食体验。而杭州的西湖美景、千岛湖风光，为这次商务旅行增添了诗意的色彩。',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    156
),
(
    '杭州宁波4晚5天深度游：西湖到天一阁的完美江南之旅',
    'Hangzhou-Ningbo 4-Night 5-Day Deep Tour',
    'hangzhou-ningbo-tour',
    '行程规划',
    '杭州,宁波',
    '详细的杭州宁波4晚5天旅游攻略，从西湖美景到天一阁藏书楼，完整的交通、住宿、美食、景点推荐。',
    '杭州和宁波是江南地区最具代表性的两座城市。杭州以西湖闻名天下，宁波则以深厚的商业文化和历史底蕴著称。这条4晚5天的路线，将带您领略从古典园林到现代都市的完美过渡，体验江南水乡的独特魅力。',
    'https://s.coze.cn/image/laRk9ry12X4/',
    true,
    false,
    89
),
(
    '西湖一日闲游：从晨光到暮色的环湖漫记',
    'West Lake Day Tour: From Dawn to Dusk',
    'xihu-tour',
    '景点游览',
    '杭州',
    '跟随我们的脚步，体验西湖从晨光到暮色的一日游，感受这座千年古湖的诗意与浪漫。',
    '西湖，这座承载着千年文化的古湖，每一个时刻都有着不同的美。从晨光熹微的断桥残雪，到夕阳西下的雷峰夕照，一天的时光足以让您领略西湖的万种风情。苏堤春晓、曲院风荷、三潭印月，每一处景致都有着深厚的文化内涵。',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    234
),
(
    'Yiwu Two-Day Tour: Small Commodities & International Culture',
    NULL,
    'yiwu-tour',
    'Attractions',
    'Yiwu',
    'Explore Yiwu, the "World''s Supermarket" known for hosting the largest small commodity wholesale market on the planet.',
    'Yiwu International Trade City is a marvel of modern commerce, spanning over 5 million square meters and housing more than 75,000 booths. This two-day itinerary will guide you through the bustling markets, cultural sites, and local experiences that make Yiwu a unique destination for both business and leisure travelers.',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    67
),
(
    '绍兴2天深度游全攻略：跟着课本游江南',
    'Two Days in Shaoxing: Complete Guide',
    'shaoxing-travel-guide',
    '文化体验',
    '绍兴',
    '从鲁迅故里到兰亭圣地，从沈园绝唱到东湖奇景，两天时间深度体验绍兴的文化魅力与水乡风情。',
    '绍兴，这座有着2500年历史的文化古城，孕育了无数文人墨客。从鲁迅的《从百草园到三味书屋》到王羲之的《兰亭集序》，从陆游与唐婉的爱情悲歌到东湖的奇石秀水，绍兴的每一处风景都承载着深厚的文化底蕴。',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    123
),
(
    '乌镇水乡一日游：东方威尼斯的诗意时光',
    'A Day in Wuzhen: Exploring China''s Venice of the East',
    'wuzhen-tour',
    '景点游览',
    '乌镇',
    '步入时光倒流的古镇乌镇，感受东方威尼斯的独特魅力，体验千年水乡的宁静与美好。',
    '乌镇，被誉为"东方威尼斯"的千年古镇，保存着最完整的江南水乡风貌。青石板路、小桥流水、白墙黛瓦，每一处风景都诉说着古老的故事。在这里，时间仿佛静止，让人忘却都市的喧嚣，沉浸在诗意的江南时光中。',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    198
),
(
    '杭州美食探秘：龙井虾仁的故事',
    'Hangzhou Culinary Treasures: The Story of Longjing Shrimp',
    'hangzhou-food',
    '美食攻略',
    '杭州',
    '探索杭州的美食文化，品味龙井虾仁这道融合了茶香与鲜美的经典江南菜肴。',
    '杭州不仅有美丽的西湖，更有令人垂涎的美食文化。龙井虾仁作为杭州的招牌菜，完美融合了西湖龙井茶的清香与河虾的鲜美，体现了江南菜肴精致、清淡、注重原味的特色。这道菜不仅是味觉的享受，更是文化的传承。',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    145
),
(
    '苏州园林：诗意与景观设计的完美结合',
    'Suzhou Gardens: Where Poetry Meets Landscape Design',
    'suzhou-gardens',
    '文化体验',
    '苏州',
    '苏州古典园林是中国哲学与美学的活化石，从拙政园到留园，每一处空间都诉说着人与自然和谐共生的故事。',
    '苏州古典园林代表了中国园林艺术的最高成就。这些园林不仅是建筑艺术的杰作，更是中国文人精神世界的物化体现。从拙政园的开阔大气到留园的精致雅致，每一座园林都有着独特的个性和深厚的文化内涵。',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    276
)
ON CONFLICT (slug) DO NOTHING;

-- 查询插入结果
SELECT id, title, slug, category, city, published, view_count, created_at 
FROM articles 
ORDER BY created_at DESC;