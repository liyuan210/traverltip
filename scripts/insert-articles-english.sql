-- Insert article data directly in Supabase SQL Editor
-- This bypasses RLS restrictions

-- Insert article data
INSERT INTO articles (
    title, title_en, slug, category, city, excerpt, content, 
    featured_image, published, featured, view_count
) VALUES 
(
    'Shanghai-Hangzhou Business & Leisure Journey: Perfect Balance of Work and Vacation',
    'Shanghai-Hangzhou Business & Leisure Journey',
    'shanghai-hangzhou-tour',
    'itinerary',
    'Shanghai,Hangzhou',
    'Complete travel guide from USA to Shanghai and Hangzhou, combining business work with leisure vacation, detailed transportation, accommodation, and food recommendations.',
    'This is a journey that perfectly combines business and leisure. Starting from the USA, experiencing the bustling metropolis of Shanghai, then to the Jiangnan water town charm of Hangzhou, the entire itinerary is compact and fulfilling. Shanghai, as an international metropolis, not only has a modern business environment, but also rich cultural heritage and culinary experiences. The beautiful scenery of West Lake and Thousand Island Lake in Hangzhou adds poetic color to this business trip.',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    156
),
(
    'Hangzhou-Ningbo 4-Night 5-Day Deep Tour: Perfect Jiangnan Journey from West Lake to Tianyi Pavilion',
    'Hangzhou-Ningbo 4-Night 5-Day Deep Tour',
    'hangzhou-ningbo-tour',
    'itinerary',
    'Hangzhou,Ningbo',
    'Detailed 4-night 5-day travel guide for Hangzhou and Ningbo, from West Lake scenery to Tianyi Pavilion library, complete transportation, accommodation, food, and attraction recommendations.',
    'Hangzhou and Ningbo are the most representative cities in the Jiangnan region. Hangzhou is famous for West Lake, while Ningbo is renowned for its profound commercial culture and historical heritage. This 4-night 5-day route will take you to experience the perfect transition from classical gardens to modern cities, and feel the unique charm of Jiangnan water towns.',
    'https://s.coze.cn/image/laRk9ry12X4/',
    true,
    false,
    89
),
(
    'West Lake Day Tour: Leisurely Lake Circuit from Dawn to Dusk',
    'West Lake Day Tour: From Dawn to Dusk',
    'xihu-tour',
    'attractions',
    'Hangzhou',
    'Follow our steps to experience a day tour of West Lake from dawn to dusk, feeling the poetry and romance of this thousand-year-old ancient lake.',
    'West Lake, this ancient lake carrying a thousand years of culture, has different beauty at every moment. From the dawn light at Broken Bridge to the sunset at Leifeng Pagoda, a days time is enough for you to appreciate the myriad charms of West Lake. Su Causeway Spring Dawn, Curved Courtyard Lotus Breeze, Three Pools Mirroring the Moon - each scenic spot has profound cultural connotations.',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    234
),
(
    'Yiwu Two-Day Tour: Small Commodities & International Culture',
    'Yiwu Two-Day Tour: Small Commodities & International Culture',
    'yiwu-tour',
    'attractions',
    'Yiwu',
    'Explore Yiwu, the Worlds Supermarket known for hosting the largest small commodity wholesale market on the planet.',
    'Yiwu International Trade City is a marvel of modern commerce, spanning over 5 million square meters and housing more than 75,000 booths. This two-day itinerary will guide you through the bustling markets, cultural sites, and local experiences that make Yiwu a unique destination for both business and leisure travelers.',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    67
),
(
    'Shaoxing 2-Day Deep Tour Complete Guide: Following Textbooks to Tour Jiangnan',
    'Two Days in Shaoxing: Complete Guide',
    'shaoxing-travel-guide',
    'culture',
    'Shaoxing',
    'From Lu Xun hometown to Lanting sacred place, from Shen Garden love story to East Lake wonders, two days to deeply experience the cultural charm and water town style of Shaoxing.',
    'Shaoxing, this cultural ancient city with 2500 years of history, has nurtured countless literati. From Lu Xuns From Baicao Garden to Sanwei Study to Wang Xizhis Lanting Preface, from Lu You and Tang Wans love tragedy to the strange stones and beautiful waters of East Lake, every scenery in Shaoxing carries profound cultural heritage.',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    123
),
(
    'Wuzhen Water Town Day Tour: Poetic Time in the Venice of the East',
    'A Day in Wuzhen: Exploring Chinas Venice of the East',
    'wuzhen-tour',
    'attractions',
    'Wuzhen',
    'Step into the time-traveling ancient town of Wuzhen, feel the unique charm of the Venice of the East, and experience the tranquility and beauty of the thousand-year water town.',
    'Wuzhen, known as the Venice of the East, is a thousand-year-old ancient town that preserves the most complete Jiangnan water town style. Bluestone roads, small bridges over flowing water, white walls and black tiles - every scenery tells ancient stories. Here, time seems to stand still, making people forget the hustle and bustle of the city and immerse themselves in the poetic Jiangnan time.',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    198
),
(
    'Hangzhou Culinary Exploration: The Story of Longjing Shrimp',
    'Hangzhou Culinary Treasures: The Story of Longjing Shrimp',
    'hangzhou-food',
    'food',
    'Hangzhou',
    'Explore Hangzhous food culture and taste Longjing Shrimp, a classic Jiangnan dish that combines tea fragrance with freshness.',
    'Hangzhou not only has the beautiful West Lake, but also mouth-watering food culture. Longjing Shrimp, as Hangzhous signature dish, perfectly combines the fragrance of West Lake Longjing tea with the freshness of river shrimp, embodying the characteristics of Jiangnan cuisine: exquisite, light, and focusing on original flavors. This dish is not only a taste enjoyment, but also a cultural inheritance.',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    false,
    145
),
(
    'Suzhou Gardens: Perfect Combination of Poetry and Landscape Design',
    'Suzhou Gardens: Where Poetry Meets Landscape Design',
    'suzhou-gardens',
    'culture',
    'Suzhou',
    'Suzhou classical gardens are living fossils of Chinese philosophy and aesthetics. From Humble Administrators Garden to Lingering Garden, every space tells the story of harmonious coexistence between humans and nature.',
    'Suzhou classical gardens represent the highest achievement of Chinese garden art. These gardens are not only masterpieces of architectural art, but also the materialization of Chinese literati spiritual world. From the open atmosphere of Humble Administrators Garden to the exquisite elegance of Lingering Garden, each garden has its unique personality and profound cultural connotations.',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp',
    true,
    true,
    276
)
ON CONFLICT (slug) DO NOTHING;

-- Query insertion results
SELECT id, title, slug, category, city, published, view_count, created_at 
FROM articles 
ORDER BY created_at DESC;