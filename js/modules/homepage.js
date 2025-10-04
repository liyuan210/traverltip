// 首页动态内容管理模块
import { travelAPI } from './supabase-client.js';

export class HomepageManager {
  constructor() {
    this.isLoading = false;
    this.init();
  }

  async init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadContent());
    } else {
      await this.loadContent();
    }
  }

  // 加载首页内容
  async loadContent() {
    try {
      this.showLoading();
      
      // 并行加载数据
      const [featuredArticles, popularArticles, categories, cities] = await Promise.all([
        travelAPI.getArticles({ featured: true, limit: 6 }),
        travelAPI.getPopularArticles(6),
        travelAPI.getCategories(),
        travelAPI.getCities()
      ]);

      // 渲染各个版块
      this.renderFeaturedArticles(featuredArticles);
      this.renderPopularArticles(popularArticles);
      this.renderCategories(categories);
      this.renderCities(cities);
      
      this.hideLoading();
      
    } catch (error) {
      console.error('加载首页内容失败:', error);
      this.showError();
    }
  }

  // 渲染精选文章
  renderFeaturedArticles(articles) {
    const container = document.querySelector('.featured-articles');
    if (!container || articles.length === 0) return;

    const articlesHTML = articles.map(article => `
      <article class="featured-article">
        <div class="article-image">
          <img src="${article.featured_image || '../images/placeholder.svg'}" 
               alt="${article.image_alt || article.title}" 
               loading="lazy">
          ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="article-content">
          <div class="article-meta">
            <span class="category">${article.category}</span>
            <span class="city">${article.city}</span>
            <span class="date">${article.created_at_formatted}</span>
          </div>
          <h3 class="article-title">
            <a href="${travelAPI.generateArticleUrl(article)}">${article.title_en || article.title}</a>
          </h3>
          <p class="article-excerpt">${article.excerpt_en || article.excerpt}</p>
          <div class="article-stats">
            <span class="view-count">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              ${article.view_count || 0}
            </span>
          </div>
        </div>
      </article>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Featured Articles</h2>
        <a href="/articles/" class="view-all">
          View All →
        </a>
      </div>
      <div class="articles-grid">
        ${articlesHTML}
      </div>
    `;
  }

  // 渲染热门文章
  renderPopularArticles(articles) {
    const container = document.querySelector('.popular-articles');
    if (!container || articles.length === 0) return;

    const articlesHTML = articles.map((article, index) => `
      <div class="popular-item">
        <span class="rank">${index + 1}</span>
        <div class="popular-content">
          <h4><a href="${travelAPI.generateArticleUrl(article)}">${article.title}</a></h4>
          <div class="popular-meta">
            <span class="city">${article.city}</span>
            <span class="views">${article.view_count || 0} views</span>
          </div>
        </div>
        <div class="popular-image">
          <img src="${article.featured_image || '../images/placeholder.svg'}" 
               alt="${article.title}" 
               loading="lazy">
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Popular Articles</h2>
      </div>
      <div class="popular-list">
        ${articlesHTML}
      </div>
    `;
  }

  // 渲染分类
  renderCategories(categories) {
    const container = document.querySelector('.categories-section');
    if (!container || categories.length === 0) return;

    const categoriesHTML = categories.map(category => `
      <div class="category-card" data-category="${category.slug}">
        <div class="category-icon">
          ${this.getCategoryIcon(category.slug)}
        </div>
        <h3>${category.name}</h3>
        <p>${category.description || ''}</p>
        <button class="category-btn" onclick="filterByCategory('${category.slug}')">
          Explore
        </button>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Explore by Category</h2>
      </div>
      <div class="categories-grid">
        ${categoriesHTML}
      </div>
    `;
  }

  // 渲染城市
  renderCities(cities) {
    const container = document.querySelector('.cities-section');
    if (!container || cities.length === 0) return;

    const citiesHTML = cities.map(city => `
      <div class="city-card" data-city="${city.slug}">
        <div class="city-image">
          <img src="../images/${city.slug}-card.svg" 
               alt="${city.name}" 
               loading="lazy"
               onerror="this.src='../images/placeholder.svg'">
        </div>
        <div class="city-info">
          <h3>${city.name}</h3>
          <button class="city-btn" onclick="filterByCity('${city.name}')">
            ${travelAPI.currentLanguage === 'en' ? 'Discover' : '发现'}
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Popular Destinations</h2>
      </div>
      <div class="cities-grid">
        ${citiesHTML}
      </div>
    `;
  }

  // 获取分类图标
  getCategoryIcon(slug) {
    const icons = {
      'food': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>`,
      'attractions': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>`,
      'hotels': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>`,
      'transport': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
      </svg>`,
      'shopping': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>`,
      'culture': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>`,
      'itinerary': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>`
    };
    
    return icons[slug] || icons['attractions'];
  }

  // 显示加载状态
  showLoading() {
    const containers = [
      '.featured-articles',
      '.popular-articles', 
      '.categories-section',
      '.cities-section'
    ];

    containers.forEach(selector => {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = `
          <div class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        `;
      }
    });
  }

  // 隐藏加载状态
  hideLoading() {
    // 加载完成后移除加载状态
    document.querySelectorAll('.loading-placeholder').forEach(el => {
      el.remove();
    });
  }

  // 显示错误
  showError() {
    const containers = document.querySelectorAll('.loading-placeholder');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="error-message">
          <p>Failed to load content</p>
          <button onclick="location.reload()" class="retry-btn">
            Retry
          </button>
        </div>
      `;
    });
  }
}

// 全局筛选函数
window.filterByCategory = async function(categorySlug) {
  const articles = await travelAPI.getArticles({ category: categorySlug });
  // 这里可以跳转到文章列表页或者显示筛选结果
  console.log('Category articles:', articles);
};

window.filterByCity = async function(cityName) {
  const articles = await travelAPI.getArticles({ city: cityName });
  // 这里可以跳转到文章列表页或者显示筛选结果
  console.log('City articles:', articles);
};

// 首页相关样式
export const homepageStyles = `
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: var(--secondary-color, #2c3e50);
  margin: 0;
}

.view-all {
  color: var(--primary-color, #e83e8c);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: var(--secondary-color, #2c3e50);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.featured-article {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.featured-article:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.article-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-article:hover .article-image img {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary-color, #e83e8c);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.article-content {
  padding: 20px;
}

.article-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
}

.article-meta span {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.category {
  background: rgba(232, 62, 140, 0.1);
  color: var(--primary-color, #e83e8c);
}

.city {
  background: rgba(44, 62, 80, 0.1);
  color: var(--secondary-color, #2c3e50);
}

.date {
  background: #f0f0f0;
  color: #666;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

.article-title a {
  color: var(--secondary-color, #2c3e50);
  text-decoration: none;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: var(--primary-color, #e83e8c);
}

.article-excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.popular-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.popular-item:hover {
  transform: translateX(4px);
}

.rank {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color, #e83e8c);
  min-width: 24px;
}

.popular-content {
  flex: 1;
}

.popular-content h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.popular-content h4 a {
  color: var(--secondary-color, #2c3e50);
  text-decoration: none;
}

.popular-content h4 a:hover {
  color: var(--primary-color, #e83e8c);
}

.popular-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.popular-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.popular-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.category-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
}

.category-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: rgba(232, 62, 140, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #e83e8c);
}

.category-card h3 {
  margin: 0 0 8px 0;
  color: var(--secondary-color, #2c3e50);
}

.category-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.category-btn {
  background: var(--primary-color, #e83e8c);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.category-btn:hover {
  background: var(--secondary-color, #2c3e50);
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.city-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.city-card:hover {
  transform: translateY(-4px);
}

.city-image {
  height: 120px;
  overflow: hidden;
}

.city-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-info {
  padding: 16px;
  text-align: center;
}

.city-info h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: var(--secondary-color, #2c3e50);
}

.city-btn {
  background: transparent;
  color: var(--primary-color, #e83e8c);
  border: 1px solid var(--primary-color, #e83e8c);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.city-btn:hover {
  background: var(--primary-color, #e83e8c);
  color: white;
}

.loading-placeholder {
  text-align: center;
  padding: 48px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color, #e83e8c);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.error-message {
  text-align: center;
  padding: 48px;
  color: #dc3545;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .cities-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .popular-item {
    flex-direction: column;
    text-align: center;
  }
  
  .popular-image {
    width: 80px;
    height: 80px;
  }
}
`;

// 自动初始化
if (typeof window !== 'undefined') {
  // 添加样式
  const styleSheet = document.createElement('style');
  styleSheet.textContent = homepageStyles;
  document.head.appendChild(styleSheet);
  
  // 初始化首页管理器
  window.homepageManager = new HomepageManager();
}

export default HomepageManager;