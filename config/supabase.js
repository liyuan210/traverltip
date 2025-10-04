// Supabase 配置文件
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://hqpcnflogdhcqddipaso.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcGNuZmxvZ2RoY3FkZGlwYXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDQzNjQsImV4cCI6MjA0ODg4MDM2NH0.NDkumv4cclBMA3TA5jVMMnD1ufXyd_pbcZEYCmbqGOTsIvMYqcW1gIQTFnwTDl'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表名常量
export const TABLES = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories', 
  SETTINGS: 'settings',
  USERS: 'users'
}

// API 辅助函数
export const supabaseApi = {
  // 获取所有文章
  async getArticles(filters = {}) {
    let query = supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.language) {
      // 根据语言返回对应字段
      if (filters.language === 'en') {
        query = query.select('*, title:title_en, content:content_en')
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // 根据slug获取单篇文章
  async getArticleBySlug(slug, language = 'zh') {
    let query = supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    const { data, error } = await query
    if (error) throw error
    
    // 根据语言返回对应内容
    if (language === 'en' && data.title_en) {
      data.title = data.title_en
      data.content = data.content_en
    }
    
    return data
  },

  // 搜索文章
  async searchArticles(searchTerm, language = 'zh') {
    const column = language === 'en' ? 'title_en,content_en' : 'title,content'
    
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .textSearch(column, searchTerm)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 获取分类列表
  async getCategories() {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  // 获取城市列表
  async getCities() {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('city')
      .not('city', 'is', null)
      .order('city')

    if (error) throw error
    
    // 去重并返回城市列表
    const cities = [...new Set(data.map(item => item.city))]
    return cities.map(city => ({ name: city, slug: city.toLowerCase().replace(/\s+/g, '-') }))
  },

  // 管理员功能 - 创建文章
  async createArticle(articleData) {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .insert([articleData])
      .select()

    if (error) throw error
    return data[0]
  },

  // 管理员功能 - 更新文章
  async updateArticle(id, articleData) {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .update({
        ...articleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  },

  // 管理员功能 - 删除文章
  async deleteArticle(id) {
    const { error } = await supabase
      .from(TABLES.ARTICLES)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export default supabase