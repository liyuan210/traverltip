// 前端Supabase客户端模块
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase配置（前端安全的公开密钥）
const supabaseUrl = 'https://hqpcnflogdhcqddipaso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcGNuZmxvZ2RoY3FkZGlwYXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDQzNjQsImV4cCI6MjA0ODg4MDM2NH0.NDkumv4cclBMA3TA5jVMMnD1ufXyd_pbcZEYCmbqGOTsIvMYqcW1gIQTFnwTDl';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API服务类
export class TravelAPI {
  constructor() {
    this.currentLanguage = this.detectLanguage();
  }

  // 检测当前语言
  detectLanguage() {
    const path = window.location.pathname;
    const lang = localStorage.getItem('preferredLanguage');
    
    if (path.includes('_en.html') || lang === 'en') {
      return 'en';
    }
    return 'zh';
  }

  // 设置语言
  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
  }

  // 获取所有文章
  async getArticles(filters = {}) {
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      // 应用过滤器
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.featured) {
        query = query.eq('featured', true);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // 根据语言返回对应字段
      return data.map(article => this.formatArticle(article));
      
    } catch (error) {
      console.error('获取文章失败:', error);
      return [];
    }
  }

  // 根据slug获取单篇文章
  async getArticleBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      
      // 增加浏览量
      await this.incrementViewCount(data.id);
      
      return this.formatArticle(data);
      
    } catch (error) {
      console.error('获取文章详情失败:', error);
      return null;
    }
  }

  // 搜索文章
  async searchArticles(searchTerm, filters = {}) {
    try {
      if (!searchTerm.trim()) {
        return await this.getArticles(filters);
      }

      // 使用PostgreSQL全文搜索
      const searchColumn = this.currentLanguage === 'en' 
        ? 'title_en,content_en,excerpt_en' 
        : 'title,content,excerpt';

      let query = supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      // 应用过滤器
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data.map(article => this.formatArticle(article));
      
    } catch (error) {
      console.error('搜索文章失败:', error);
      return [];
    }
  }

  // 获取分类列表
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map(category => ({
        ...category,
        name: this.currentLanguage === 'en' && category.name_en ? category.name_en : category.name
      }));
      
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  }

  // 获取城市列表
  async getCities() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('city')
        .eq('published', true)
        .not('city', 'is', null);

      if (error) throw error;
      
      // 去重并排序
      const cities = [...new Set(data.map(item => item.city))].sort();
      return cities.map(city => ({
        name: city,
        slug: city.toLowerCase().replace(/\s+/g, '-')
      }));
      
    } catch (error) {
      console.error('获取城市列表失败:', error);
      return [];
    }
  }

  // 获取热门文章
  async getPopularArticles(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(article => this.formatArticle(article));
      
    } catch (error) {
      console.error('获取热门文章失败:', error);
      return [];
    }
  }

  // 增加文章浏览量
  async incrementViewCount(articleId) {
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        article_id: articleId
      });

      if (error) {
        // 如果RPC函数不存在，使用常规更新
        const { data: article } = await supabase
          .from('articles')
          .select('view_count')
          .eq('id', articleId)
          .single();

        if (article) {
          await supabase
            .from('articles')
            .update({ view_count: (article.view_count || 0) + 1 })
            .eq('id', articleId);
        }
      }
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
  }

  // 格式化文章数据（根据当前语言）
  formatArticle(article) {
    const isEnglish = this.currentLanguage === 'en';
    
    return {
      ...article,
      title: isEnglish && article.title_en ? article.title_en : article.title,
      content: isEnglish && article.content_en ? article.content_en : article.content,
      excerpt: isEnglish && article.excerpt_en ? article.excerpt_en : article.excerpt,
      meta_title: isEnglish && article.meta_title_en ? article.meta_title_en : article.meta_title,
      meta_description: isEnglish && article.meta_description_en ? article.meta_description_en : article.meta_description,
      // 格式化日期
      created_at_formatted: this.formatDate(article.created_at),
      updated_at_formatted: this.formatDate(article.updated_at)
    };
  }

  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString);
    const isEnglish = this.currentLanguage === 'en';
    
    if (isEnglish) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // 生成文章URL
  generateArticleUrl(article, language = null) {
    const lang = language || this.currentLanguage;
    const baseUrl = window.location.origin;
    
    if (lang === 'en') {
      return `${baseUrl}/articles/${article.slug}_en.html`;
    } else {
      return `${baseUrl}/articles/${article.slug}.html`;
    }
  }
}

// 创建全局API实例
export const travelAPI = new TravelAPI();

// 导出默认实例
export default travelAPI;