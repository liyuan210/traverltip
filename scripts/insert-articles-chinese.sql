-- 中文版本的文章插入脚本
-- 在Supabase SQL编辑器中执行

INSERT INTO articles (
    title, title_en, slug, category, city, excerpt, content, 
    featured_image, published, featured, view_count
) VALUES 
(
    '上海杭州商务休闲之旅',
    'Shanghai-Hangzhou Business & Leisure Journey',
    'shanghai-hangzhou-business-tour',
    'itinerary',
    'Shanghai,Hangzhou',
    '从美国到上海再到杭州的完整旅游攻略，包含商务工作与休闲度假的完美结合。',
    '这是一次完美结合商务与休闲的旅程。从美国出发，经过上海的繁华都市体验，再到杭州的江南水乡风情，整个行程安排紧凑而充实。',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9',
    true,
    true,
    156
),
(
    '杭州宁波4晚5天深度游',
    'Hangzhou-Ningbo 4-Night 5-Day Deep Tour',
    'hangzhou-ningbo-5day-tour',
    'itinerary',
    'Hangzhou,Ningbo',
    '详细的杭州宁波4晚5天旅游攻略，从西湖美景到天一阁藏书楼。',
    '杭州和宁波是江南地区最具代表性的两座城市。这条4晚5天的路线，将带您领略从古典园林到现代都市的完美过渡。',
    'https://s.coze.cn/image/laRk9ry12X4/',
    true,
    false,
    89
),
(
    '西湖一日闲游',
    'West Lake Day Tour',
    'xihu-oneday-tour',
    'attractions',
    'Hangzhou',
    '跟随我们的脚步，体验西湖从晨光到暮色的一日游。',
    '西湖，这座承载着千年文化的古湖，每一个时刻都有着不同的美。从晨光熹微的断桥残雪，到夕阳西下的雷峰夕照。',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371',
    true,
    false,
    234
),
(
    '绍兴2天深度游全攻略',
    'Two Days in Shaoxing Complete Guide',
    'shaoxing-2day-guide',
    'culture',
    'Shaoxing',
    '从鲁迅故里到兰亭圣地，两天时间深度体验绍兴的文化魅力。',
    '绍兴，这座有着2500年历史的文化古城，孕育了无数文人墨客。从鲁迅的作品到王羲之的兰亭集序。',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    true,
    false,
    123
),
(
    '乌镇水乡一日游',
    'A Day in Wuzhen Water Town',
    'wuzhen-oneday-tour',
    'attractions',
    'Wuzhen',
    '步入时光倒流的古镇乌镇，感受东方威尼斯的独特魅力。',
    '乌镇，被誉为东方威尼斯的千年古镇，保存着最完整的江南水乡风貌。青石板路、小桥流水、白墙黛瓦。',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9',
    true,
    true,
    198
),
(
    '杭州美食探秘：龙井虾仁',
    'Hangzhou Culinary: Longjing Shrimp',
    'hangzhou-longjing-shrimp',
    'food',
    'Hangzhou',
    '探索杭州的美食文化，品味龙井虾仁这道融合了茶香与鲜美的经典江南菜肴。',
    '杭州不仅有美丽的西湖，更有令人垂涎的美食文化。龙井虾仁作为杭州的招牌菜，完美融合了西湖龙井茶的清香与河虾的鲜美。',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    true,
    false,
    145
),
(
    '苏州园林：诗意与景观设计',
    'Suzhou Gardens: Poetry and Landscape',
    'suzhou-gardens-design',
    'culture',
    'Suzhou',
    '苏州古典园林是中国哲学与美学的活化石，每一处空间都诉说着人与自然和谐共生的故事。',
    '苏州古典园林代表了中国园林艺术的最高成就。从拙政园的开阔大气到留园的精致雅致，每一座园林都有着独特的个性。',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9',
    true,
    true,
    276
)
ON CONFLICT (slug) DO NOTHING;

-- 查询插入结果
SELECT id, title, slug, category, city, published, view_count, created_at 
FROM articles 
ORDER BY created_at DESC;