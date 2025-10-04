// 语言切换模块
import { travelAPI } from './supabase-client.js';

export class LanguageSwitcher {
  constructor() {
    this.currentLanguage = travelAPI.currentLanguage;
    this.init();
  }

  init() {
    this.createLanguageSwitcher();
    this.bindEvents();
    this.updatePageContent();
  }

  // 创建语言切换器UI
  createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <div class="lang-toggle">
        <button class="lang-btn ${this.currentLanguage === 'zh' ? 'active' : ''}" data-lang="zh">
          中文
        </button>
        <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
          EN
        </button>
      </div>
    `;

    // 添加到导航栏
    const nav = document.querySelector('nav');
    if (nav) {
      nav.appendChild(switcher);
    }
  }

  // 绑定事件
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.lang-btn')) {
        const newLang = e.target.getAttribute('data-lang');
        this.switchLanguage(newLang);
      }
    });
  }

  // 切换语言
  async switchLanguage(newLang) {
    if (newLang === this.currentLanguage) return;

    this.currentLanguage = newLang;
    travelAPI.setLanguage(newLang);

    // 更新按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
    });

    // 更新页面内容
    await this.updatePageContent();
    
    // 触发语言切换事件
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: newLang }
    }));
  }

  // 更新页面内容
  async updatePageContent() {
    // 检查当前页面类型
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
      // 首页 - 重新加载动态内容
      if (window.homepageManager) {
        await window.homepageManager.loadContent();
      }
    } else if (path.includes('/articles/')) {
      // 文章页面 - 尝试切换到对应语言版本
      this.switchArticlePage();
    }

    // 更新静态文本
    this.updateStaticTexts();
  }

  // 切换文章页面语言版本
  switchArticlePage() {
    const currentPath = window.location.pathname;
    let newPath;

    if (this.currentLanguage === 'en') {
      // 切换到英文版本
      if (currentPath.includes('_en.html')) {
        return; // 已经是英文版本
      } else {
        newPath = currentPath.replace('.html', '_en.html');
      }
    } else {
      // 切换到中文版本
      if (currentPath.includes('_en.html')) {
        newPath = currentPath.replace('_en.html', '.html');
      } else {
        return; // 已经是中文版本
      }
    }

    // 检查目标页面是否存在
    fetch(newPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.location.href = newPath;
        } else {
          // 如果对应语言版本不存在，显示提示
          this.showLanguageNotAvailable();
        }
      })
      .catch(() => {
        this.showLanguageNotAvailable();
      });
  }

  // 显示语言不可用提示
  showLanguageNotAvailable() {
    const message = this.currentLanguage === 'en' 
      ? 'This article is not available in English yet.' 
      : '此文章暂无中文版本。';
    
    // 创建提示框
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // 更新静态文本
  updateStaticTexts() {
    const texts = {
      zh: {
        'search-placeholder': '搜索文章...',
        'home': '首页',
        'articles': '文章',
        'about': '关于',
        'contact': '联系',
        'read-more': '阅读更多',
        'view-all': '查看全部',
        'loading': '加载中...',
        'search': '搜索',
        'no-results': '没有找到相关文章',
        'try-different': '尝试使用不同的关键词',
        'featured': '精选',
        'popular': '热门',
        'latest': '最新',
        'categories': '分类',
        'destinations': '目的地'
      },
      en: {
        'search-placeholder': 'Search articles...',
        'home': 'Home',
        'articles': 'Articles',
        'about': 'About',
        'contact': 'Contact',
        'read-more': 'Read More',
        'view-all': 'View All',
        'loading': 'Loading...',
        'search': 'Search',
        'no-results': 'No articles found',
        'try-different': 'Try different keywords',
        'featured': 'Featured',
        'popular': 'Popular',
        'latest': 'Latest',
        'categories': 'Categories',
        'destinations': 'Destinations'
      }
    };

    const currentTexts = texts[this.currentLanguage];
    
    // 更新具有data-text属性的元素
    document.querySelectorAll('[data-text]').forEach(element => {
      const textKey = element.getAttribute('data-text');
      if (currentTexts[textKey]) {
        element.textContent = currentTexts[textKey];
      }
    });

    // 更新placeholder
    document.querySelectorAll('[data-placeholder]').forEach(element => {
      const placeholderKey = element.getAttribute('data-placeholder');
      if (currentTexts[placeholderKey]) {
        element.placeholder = currentTexts[placeholderKey];
      }
    });

    // 更新页面标题
    this.updatePageTitle();
  }

  // 更新页面标题
  updatePageTitle() {
    const titleMappings = {
      zh: {
        '/': '江南旅游攻略 - 发现诗意水乡',
        '/index.html': '江南旅游攻略 - 发现诗意水乡'
      },
      en: {
        '/': 'Jiangnan Travel Guide - Discover Poetic Water Towns',
        '/index.html': 'Jiangnan Travel Guide - Discover Poetic Water Towns'
      }
    };

    const currentPath = window.location.pathname;
    const titles = titleMappings[this.currentLanguage];
    
    if (titles && titles[currentPath]) {
      document.title = titles[currentPath];
    }
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 检查是否支持某种语言
  isLanguageSupported(lang) {
    return ['zh', 'en'].includes(lang);
  }
}

// 语言切换器样式
export const languageSwitcherStyles = `
.language-switcher {
  margin-left: 16px;
}

.lang-toggle {
  display: flex;
  background: #f0f0f0;
  border-radius: 20px;
  padding: 2px;
  gap: 2px;
}

.lang-btn {
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.lang-btn.active {
  background: var(--primary-color, #e83e8c);
  color: white;
}

.lang-btn:hover:not(.active) {
  background: rgba(232, 62, 140, 0.1);
  color: var(--primary-color, #e83e8c);
}

.language-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .language-switcher {
    margin-left: 8px;
  }
  
  .lang-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
`;

// 自动初始化
if (typeof window !== 'undefined') {
  // 添加样式
  const styleSheet = document.createElement('style');
  styleSheet.textContent = languageSwitcherStyles;
  document.head.appendChild(styleSheet);
  
  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.languageSwitcher = new LanguageSwitcher();
    });
  } else {
    window.languageSwitcher = new LanguageSwitcher();
  }
}

export default LanguageSwitcher;