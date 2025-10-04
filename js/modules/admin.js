// 管理后台模块
import { travelAPI } from './supabase-client.js';

export class AdminManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    console.log('🔧 初始化管理后台模块');
    
    // 验证管理员身份
    if (!this.checkAdminAuth()) {
      this.redirectToLogin();
      return;
    }
    
    // 加载当前用户信息
    this.loadCurrentUser();
    
    // 绑定全局事件
    this.bindEvents();
  }

  // 检查管理员认证
  checkAdminAuth() {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (!token || !user) {
      return false;
    }
    
    // 验证token格式（简单验证）
    try {
      const decoded = atob(token);
      const [username, timestamp] = decoded.split(':');
      
      // 检查token是否过期（24小时）
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24小时
      
      if (tokenAge > maxAge) {
        this.logout();
        return false;
      }
      
      return username === user;
    } catch (error) {
      console.error('Token验证失败:', error);
      this.logout();
      return false;
    }
  }

  // 加载当前用户信息
  loadCurrentUser() {
    this.currentUser = {
      username: localStorage.getItem('admin_user'),
      loginTime: new Date()
    };
    
    console.log('👤 当前管理员:', this.currentUser.username);
  }

  // 绑定事件
  bindEvents() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.refreshAuthStatus();
      }
    });

    // 定期检查认证状态
    setInterval(() => {
      this.refreshAuthStatus();
    }, 5 * 60 * 1000); // 每5分钟检查一次
  }

  // 刷新认证状态
  refreshAuthStatus() {
    if (!this.checkAdminAuth()) {
      alert('登录已过期，请重新登录');
      this.redirectToLogin();
    }
  }

  // 重定向到登录页
  redirectToLogin() {
    window.location.href = '/admin/login.html';
  }

  // 退出登录
  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.redirectToLogin();
  }

  // 获取管理后台统计数据
  async getDashboardStats() {
    try {
      const articles = await travelAPI.getArticles();
      const publishedArticles = articles.filter(a => a.published);
      const draftArticles = articles.filter(a => !a.published);
      const featuredArticles = articles.filter(a => a.featured);
      
      const totalViews = articles.reduce((sum, article) => {
        return sum + (article.view_count || 0);
      }, 0);
      
      const cities = [...new Set(articles.map(a => a.city).filter(Boolean))];
      const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];
      
      // 计算最近30天的文章
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentArticles = articles.filter(article => {
        return new Date(article.created_at) > thirtyDaysAgo;
      });

      return {
        articles: {
          total: articles.length,
          published: publishedArticles.length,
          draft: draftArticles.length,
          featured: featuredArticles.length,
          recent: recentArticles.length
        },
        content: {
          cities: cities.length,
          categories: categories.length,
          totalViews: totalViews,
          avgViews: articles.length > 0 ? Math.round(totalViews / articles.length) : 0
        },
        cityStats: this.calculateCityStats(articles),
        categoryStats: this.calculateCategoryStats(articles),
        recentActivity: this.getRecentActivity(articles)
      };
      
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }

  // 计算城市统计
  calculateCityStats(articles) {
    const cityCount = {};
    const cityViews = {};
    
    articles.forEach(article => {
      if (article.city) {
        cityCount[article.city] = (cityCount[article.city] || 0) + 1;
        cityViews[article.city] = (cityViews[article.city] || 0) + (article.view_count || 0);
      }
    });
    
    return Object.keys(cityCount).map(city => ({
      city,
      articleCount: cityCount[city],
      totalViews: cityViews[city],
      avgViews: Math.round(cityViews[city] / cityCount[city])
    })).sort((a, b) => b.articleCount - a.articleCount);
  }

  // 计算分类统计
  calculateCategoryStats(articles) {
    const categoryCount = {};
    const categoryViews = {};
    
    articles.forEach(article => {
      if (article.category) {
        categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
        categoryViews[article.category] = (categoryViews[article.category] || 0) + (article.view_count || 0);
      }
    });
    
    return Object.keys(categoryCount).map(category => ({
      category,
      articleCount: categoryCount[category],
      totalViews: categoryViews[category],
      avgViews: Math.round(categoryViews[category] / categoryCount[category])
    })).sort((a, b) => b.articleCount - a.articleCount);
  }

  // 获取最近活动
  getRecentActivity(articles) {
    return articles
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 10)
      .map(article => ({
        id: article.id,
        title: article.title,
        action: article.updated_at !== article.created_at ? 'updated' : 'created',
        time: article.updated_at || article.created_at,
        city: article.city,
        category: article.category
      }));
  }

  // 批量操作文章
  async bulkUpdateArticles(articleIds, updates) {
    try {
      const results = await Promise.all(
        articleIds.map(id => travelAPI.updateArticle(id, updates))
      );
      
      console.log(`✅ 批量更新了 ${results.length} 篇文章`);
      return results;
      
    } catch (error) {
      console.error('批量更新失败:', error);
      throw error;
    }
  }

  // 导出数据
  async exportData(format = 'json') {
    try {
      const articles = await travelAPI.getArticles();
      const stats = await this.getDashboardStats();
      
      const exportData = {
        metadata: {
          exportTime: new Date().toISOString(),
          totalArticles: articles.length,
          exportedBy: this.currentUser.username,
          version: '1.0'
        },
        articles: articles,
        statistics: stats
      };
      
      if (format === 'json') {
        this.downloadJSON(exportData, 'traveltip-export.json');
      } else if (format === 'csv') {
        this.downloadCSV(articles, 'traveltip-articles.csv');
      }
      
      console.log('✅ 数据导出完成');
      
    } catch (error) {
      console.error('导出数据失败:', error);
      throw error;
    }
  }

  // 下载JSON文件
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    this.downloadBlob(blob, filename);
  }

  // 下载CSV文件
  downloadCSV(articles, filename) {
    const headers = ['ID', '标题', 'Slug', '城市', '分类', '状态', '浏览量', '创建时间'];
    const rows = articles.map(article => [
      article.id,
      article.title,
      article.slug,
      article.city,
      article.category,
      article.published ? '已发布' : '草稿',
      article.view_count || 0,
      new Date(article.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    this.downloadBlob(blob, filename);
  }

  // 下载Blob文件
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 清理缓存
  async clearCache() {
    try {
      // 清理localStorage中的缓存数据
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('traveltip_cache_')) {
          localStorage.removeItem(key);
        }
      });
      
      // 清理sessionStorage
      sessionStorage.clear();
      
      console.log('✅ 缓存清理完成');
      
    } catch (error) {
      console.error('清理缓存失败:', error);
      throw error;
    }
  }

  // 检查系统健康状态
  async checkSystemHealth() {
    const health = {
      database: false,
      storage: false,
      api: false,
      frontend: true, // 前端总是可用的
      timestamp: new Date().toISOString()
    };
    
    try {
      // 测试数据库连接
      await travelAPI.getArticles({ limit: 1 });
      health.database = true;
    } catch (error) {
      console.warn('数据库连接失败:', error);
    }
    
    try {
      // 测试API响应
      const testResponse = await fetch('/');
      health.api = testResponse.ok;
    } catch (error) {
      console.warn('API测试失败:', error);
    }
    
    try {
      // 测试本地存储
      localStorage.setItem('health_test', 'ok');
      localStorage.removeItem('health_test');
      health.storage = true;
    } catch (error) {
      console.warn('本地存储测试失败:', error);
    }
    
    return health;
  }

  // 获取用户活动日志
  getUserActivityLog() {
    const logs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // 记录用户活动
  logActivity(action, details = {}) {
    const logs = this.getUserActivityLog();
    const newLog = {
      id: Date.now().toString(),
      action,
      details,
      user: this.currentUser.username,
      timestamp: new Date().toISOString()
    };
    
    logs.unshift(newLog);
    
    // 只保留最近100条记录
    const trimmedLogs = logs.slice(0, 100);
    localStorage.setItem('admin_activity_log', JSON.stringify(trimmedLogs));
    
    console.log('📝 记录活动:', action, details);
  }

  // 获取当前用户信息
  getCurrentUser() {
    return this.currentUser;
  }

  // 更新语言设置
  updateLanguage(language) {
    console.log('🌐 管理后台语言切换到:', language);
    // 这里可以实现管理后台的多语言支持
  }
}

export default AdminManager;