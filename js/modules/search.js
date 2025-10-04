// 搜索功能模块
import { travelAPI } from './supabase-client.js';

export class SearchManager {
  constructor() {
    this.searchInput = null;
    this.searchResults = null;
    this.searchOverlay = null;
    this.currentQuery = '';
    this.debounceTimer = null;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    this.createSearchUI();
    this.bindEvents();
  }

  // 创建搜索UI
  createSearchUI() {
    // 创建搜索框
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search articles..."
        >
        <button class="search-btn" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
      <div class="search-results" style="display: none;">
        <div class="search-results-header">
          <span class="results-count">0 results</span>
          <button class="close-search">×</button>
        </div>
        <div class="search-results-content">
          <!-- 搜索结果将在这里显示 -->
        </div>
      </div>
    `;

    // 添加到页面
    const header = document.querySelector('header nav') || document.querySelector('header');
    if (header) {
      header.appendChild(searchContainer);
    }

    // 获取元素引用
    this.searchInput = searchContainer.querySelector('.search-input');
    this.searchResults = searchContainer.querySelector('.search-results');
    this.resultsContent = searchContainer.querySelector('.search-results-content');
    this.resultsCount = searchContainer.querySelector('.results-count');
  }

  // 绑定事件
  bindEvents() {
    if (!this.searchInput) return;

    // 搜索输入事件
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // 搜索按钮点击
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch(this.searchInput.value);
      });
    }

    // 关闭搜索结果
    const closeBtn = document.querySelector('.close-search');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideSearchResults();
      });
    }

    // 点击外部关闭搜索结果
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSearchResults();
      }
    });

    // 键盘事件
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch(this.searchInput.value);
      } else if (e.key === 'Escape') {
        this.hideSearchResults();
      }
    });
  }

  // 处理搜索输入（防抖）
  handleSearchInput(query) {
    this.currentQuery = query.trim();
    
    // 清除之前的定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 如果查询为空，隐藏结果
    if (!this.currentQuery) {
      this.hideSearchResults();
      return;
    }

    // 设置防抖延迟
    this.debounceTimer = setTimeout(() => {
      this.performSearch(this.currentQuery);
    }, 300);
  }

  // 执行搜索
  async performSearch(query) {
    if (!query.trim()) return;

    this.showLoading();
    
    try {
      // 执行搜索
      const results = await travelAPI.searchArticles(query);
      
      this.displaySearchResults(results, query);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.showError('Search failed, please try again later');
    }
  }

  // 显示搜索结果
  displaySearchResults(results, query) {
    if (!this.resultsContent || !this.resultsCount) return;

    // 更新结果数量
    const countText = `${results.length} results for "${query}"`;
    this.resultsCount.textContent = countText;

    // 清空之前的结果
    this.resultsContent.innerHTML = '';

    if (results.length === 0) {
      this.resultsContent.innerHTML = `
        <div class="no-results">
          <p>No articles found</p>
          <p class="no-results-tip">
            Try different keywords or browse our categories
          </p>
        </div>
      `;
    } else {
      // 渲染搜索结果
      results.forEach(article => {
        const resultItem = this.createResultItem(article, query);
        this.resultsContent.appendChild(resultItem);
      });
    }

    this.showSearchResults();
  }

  // 创建搜索结果项
  createResultItem(article, query) {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    
    // 高亮搜索关键词
    const highlightedTitle = this.highlightSearchTerm(article.title, query);
    const highlightedExcerpt = this.highlightSearchTerm(article.excerpt || '', query);
    
    item.innerHTML = `
      <div class="result-image">
        <img src="${article.featured_image || '../images/placeholder.svg'}" 
             alt="${article.image_alt || article.title}" 
             loading="lazy">
      </div>
      <div class="result-content">
        <h3 class="result-title">
          <a href="${travelAPI.generateArticleUrl(article)}">${highlightedTitle}</a>
        </h3>
        <p class="result-excerpt">${highlightedExcerpt}</p>
        <div class="result-meta">
          <span class="result-category">${article.category}</span>
          <span class="result-city">${article.city}</span>
          <span class="result-date">${article.created_at_formatted}</span>
        </div>
      </div>
    `;

    // 点击跳转
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        const link = item.querySelector('a');
        if (link) {
          window.location.href = link.href;
        }
      }
    });

    return item;
  }

  // 高亮搜索关键词
  highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 显示加载状态
  showLoading() {
    if (!this.resultsContent) return;
    
    this.isLoading = true;
    this.resultsContent.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
    
    this.showSearchResults();
  }

  // 显示错误
  showError(message) {
    if (!this.resultsContent) return;
    
    this.resultsContent.innerHTML = `
      <div class="search-error">
        <p>${message}</p>
      </div>
    `;
    
    this.showSearchResults();
  }

  // 显示搜索结果面板
  showSearchResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'block';
      this.searchResults.classList.add('show');
    }
  }

  // 隐藏搜索结果面板
  hideSearchResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'none';
      this.searchResults.classList.remove('show');
    }
  }

  // 清空搜索
  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.currentQuery = '';
    this.hideSearchResults();
  }
}

// 搜索相关的CSS样式
export const searchStyles = `
.search-container {
  position: relative;
  margin-left: auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  padding: 8px 40px 8px 12px;
  border: 2px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #e83e8c);
  box-shadow: 0 0 0 3px rgba(232, 62, 140, 0.1);
}

.search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: color 0.3s ease;
}

.search-btn:hover {
  color: var(--primary-color, #e83e8c);
}

.search-results {
  position: absolute;
  top: 100%;
  right: 0;
  width: 500px;
  max-height: 80vh;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  transform: translateY(-10px);
  opacity: 0;
  transition: all 0.3s ease;
}

.search-results.show {
  transform: translateY(0);
  opacity: 1;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.results-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.close-search {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-search:hover {
  color: #666;
}

.search-results-content {
  max-height: 60vh;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.result-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  margin-right: 12px;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.result-title a {
  color: #333;
  text-decoration: none;
}

.result-title a:hover {
  color: var(--primary-color, #e83e8c);
}

.result-excerpt {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

.result-meta span {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 10px;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.no-results-tip {
  font-size: 14px;
  margin-top: 8px;
}

.search-loading {
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-color, #e83e8c);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-error {
  padding: 20px;
  text-align: center;
  color: #dc3545;
}

mark {
  background-color: #fff3cd;
  padding: 1px 2px;
  border-radius: 2px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-input {
    width: 200px;
  }
  
  .search-results {
    width: 90vw;
    right: -20px;
  }
  
  .result-image {
    width: 50px;
    height: 50px;
  }
}
`;

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  // 添加样式
  const styleSheet = document.createElement('style');
  styleSheet.textContent = searchStyles;
  document.head.appendChild(styleSheet);
  
  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.searchManager = new SearchManager();
    });
  } else {
    window.searchManager = new SearchManager();
  }
}

export default SearchManager;