// 主应用入口文件
import { travelAPI } from './modules/supabase-client.js';
import SearchManager from './modules/search.js';
import HomepageManager from './modules/homepage.js';
import LanguageSwitcher from './modules/language-switcher.js';

class TravelApp {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('🚀 初始化旅游网站应用...');
      
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeModules());
      } else {
        await this.initializeModules();
      }
      
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
    }
  }

  async initializeModules() {
    try {
      // 测试数据库连接
      await this.testDatabaseConnection();
      
      // 初始化核心模块
      this.modules.languageSwitcher = new LanguageSwitcher();
      this.modules.searchManager = new SearchManager();
      
      // 根据页面类型初始化对应模块
      const currentPage = this.detectPageType();
      
      switch (currentPage) {
        case 'homepage':
          this.modules.homepageManager = new HomepageManager();
          break;
        case 'article':
          this.initializeArticlePage();
          break;
        case 'admin':
          await this.initializeAdminPage();
          break;
        default:
          console.log('📄 标准页面，加载基础功能');
      }
      
      // 绑定全局事件
      this.bindGlobalEvents();
      
      this.isInitialized = true;
      console.log('✅ 应用初始化完成');
      
      // 触发初始化完成事件
      window.dispatchEvent(new CustomEvent('appInitialized', {
        detail: { app: this }
      }));
      
    } catch (error) {
      console.error('❌ 模块初始化失败:', error);
      this.showInitializationError(error);
    }
  }

  // 测试数据库连接
  async testDatabaseConnection() {
    try {
      console.log('🔗 测试数据库连接...');
      const testResult = await travelAPI.getArticles({ limit: 1 });
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.warn('⚠️ 数据库连接失败，将使用静态模式:', error.message);
      return false;
    }
  }

  // 检测页面类型
  detectPageType() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html' || path.endsWith('/')) {
      return 'homepage';
    } else if (path.includes('/articles/') && path.endsWith('.html')) {
      return 'article';
    } else if (path.includes('/admin/')) {
      return 'admin';
    } else {
      return 'other';
    }
  }

  // 初始化文章页面
  initializeArticlePage() {
    console.log('📖 初始化文章页面功能');
    
    // 增加文章浏览量
    this.trackArticleView();
    
    // 添加文章相关功能
    this.addArticleFeatures();
  }

  // 跟踪文章浏览
  async trackArticleView() {
    try {
      const slug = this.extractSlugFromPath();
      if (slug) {
        const article = await travelAPI.getArticleBySlug(slug);
        if (article) {
          console.log(`📊 文章浏览: ${article.title}`);
        }
      }
    } catch (error) {
      console.warn('浏览量统计失败:', error);
    }
  }

  // 从路径提取slug
  extractSlugFromPath() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace(/(_en)?\.html$/, '');
  }

  // 添加文章页面功能
  addArticleFeatures() {
    // 添加返回顶部按钮
    this.addBackToTopButton();
    
    // 添加文章目录（如果有标题）
    this.generateTableOfContents();
    
    // 添加相关文章推荐
    this.addRelatedArticles();
  }

  // 添加返回顶部按钮
  addBackToTopButton() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.title = travelAPI.currentLanguage === 'en' ? 'Back to top' : '返回顶部';
    
    document.body.appendChild(backToTop);
    
    // 滚动显示/隐藏
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });
    
    // 点击返回顶部
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 生成文章目录
  generateTableOfContents() {
    const headings = document.querySelectorAll('h2, h3, h4');
    if (headings.length < 3) return; // 少于3个标题不生成目录
    
    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = `
      <h4>${travelAPI.currentLanguage === 'en' ? 'Table of Contents' : '目录'}</h4>
      <ul class="toc-list"></ul>
    `;
    
    const tocList = toc.querySelector('.toc-list');
    
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      
      const li = document.createElement('li');
      li.className = `toc-${heading.tagName.toLowerCase()}`;
      li.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
      
      tocList.appendChild(li);
    });
    
    // 插入到文章开始处
    const article = document.querySelector('article, .article-content, main');
    if (article) {
      article.insertBefore(toc, article.firstChild);
    }
  }

  // 添加相关文章推荐
  async addRelatedArticles() {
    try {
      const currentSlug = this.extractSlugFromPath();
      const currentArticle = await travelAPI.getArticleBySlug(currentSlug);
      
      if (!currentArticle) return;
      
      // 获取相同城市或分类的文章
      const relatedArticles = await travelAPI.getArticles({
        city: currentArticle.city,
        limit: 4
      });
      
      // 过滤掉当前文章
      const filtered = relatedArticles.filter(article => article.slug !== currentSlug);
      
      if (filtered.length > 0) {
        this.renderRelatedArticles(filtered.slice(0, 3));
      }
      
    } catch (error) {
      console.warn('获取相关文章失败:', error);
    }
  }

  // 渲染相关文章
  renderRelatedArticles(articles) {
    const relatedSection = document.createElement('section');
    relatedSection.className = 'related-articles';
    relatedSection.innerHTML = `
      <h3>${travelAPI.currentLanguage === 'en' ? 'Related Articles' : '相关文章'}</h3>
      <div class="related-grid">
        ${articles.map(article => `
          <div class="related-item">
            <div class="related-image">
              <img src="${article.featured_image || '../images/placeholder.svg'}" 
                   alt="${article.title}" loading="lazy">
            </div>
            <div class="related-content">
              <h4><a href="${travelAPI.generateArticleUrl(article)}">${article.title}</a></h4>
              <p class="related-meta">${article.city} • ${article.category}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // 添加到页面底部
    const main = document.querySelector('main, article, .container');
    if (main) {
      main.appendChild(relatedSection);
    }
  }

  // 初始化管理页面
  async initializeAdminPage() {
    console.log('🔧 初始化管理后台');
    
    // 检查管理员权限
    const hasAdminAccess = await this.checkAdminAccess();
    
    if (!hasAdminAccess) {
      this.redirectToLogin();
      return;
    }
    
    // 加载管理后台模块
    const { AdminManager } = await import('./modules/admin.js');
    this.modules.adminManager = new AdminManager();
  }

  // 检查管理员权限
  async checkAdminAccess() {
    // 这里可以实现真正的权限检查
    // 目前简单检查是否有认证token
    const token = localStorage.getItem('admin_token');
    return !!token;
  }

  // 重定向到登录页
  redirectToLogin() {
    window.location.href = '/admin/login.html';
  }

  // 绑定全局事件
  bindGlobalEvents() {
    // 语言切换事件
    window.addEventListener('languageChanged', (e) => {
      console.log('🌐 语言已切换到:', e.detail.language);
      this.onLanguageChanged(e.detail.language);
    });
    
    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.onPageVisible();
      }
    });
  }

  // 语言切换处理
  onLanguageChanged(newLanguage) {
    // 更新所有模块的语言设置
    Object.values(this.modules).forEach(module => {
      if (module.updateLanguage) {
        module.updateLanguage(newLanguage);
      }
    });
  }

  // 窗口大小变化处理
  onWindowResize() {
    // 可以在这里处理响应式布局调整
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
  }

  // 页面重新可见时的处理
  onPageVisible() {
    // 可以在这里刷新数据或重新连接
    console.log('📱 页面重新可见');
  }

  // 显示初始化错误
  showInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>应用初始化失败</h3>
        <p>抱歉，网站功能初始化时遇到问题。</p>
        <details>
          <summary>错误详情</summary>
          <pre>${error.message}</pre>
        </details>
        <button onclick="location.reload()" class="retry-btn">重试</button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
  }

  // 获取应用状态
  getStatus() {
    return {
      initialized: this.isInitialized,
      modules: Object.keys(this.modules),
      language: travelAPI.currentLanguage,
      pageType: this.detectPageType()
    };
  }
}

// 应用相关样式
const appStyles = `
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--primary-color, #e83e8c);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  background: var(--secondary-color, #2c3e50);
  transform: translateY(-2px);
}

.table-of-contents {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  max-width: 300px;
  float: right;
  margin-left: 20px;
}

.table-of-contents h4 {
  margin: 0 0 12px 0;
  color: var(--secondary-color, #2c3e50);
  font-size: 1rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin: 8px 0;
}

.toc-list a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.toc-list a:hover {
  color: var(--primary-color, #e83e8c);
}

.toc-h3 {
  margin-left: 16px;
}

.toc-h4 {
  margin-left: 32px;
}

.related-articles {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid #e9ecef;
}

.related-articles h3 {
  margin-bottom: 24px;
  color: var(--secondary-color, #2c3e50);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.related-item {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.related-item:hover {
  transform: translateY(-2px);
}

.related-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-content {
  padding: 12px;
  flex: 1;
}

.related-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.3;
}

.related-content h4 a {
  color: var(--secondary-color, #2c3e50);
  text-decoration: none;
}

.related-content h4 a:hover {
  color: var(--primary-color, #e83e8c);
}

.related-meta {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.app-error {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.error-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  text-align: center;
}

.error-content h3 {
  color: #dc3545;
  margin-bottom: 16px;
}

.error-content details {
  text-align: left;
  margin: 16px 0;
}

.error-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.retry-btn {
  background: var(--primary-color, #e83e8c);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .table-of-contents {
    float: none;
    max-width: none;
    margin: 20px 0;
  }
  
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 16px;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
  
  .related-item {
    flex-direction: column;
  }
  
  .related-image {
    width: 100%;
    height: 120px;
  }
}
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = appStyles;
document.head.appendChild(styleSheet);

// 创建全局应用实例
window.travelApp = new TravelApp();

// 导出应用类
export default TravelApp;