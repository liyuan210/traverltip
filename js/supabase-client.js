// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js'

// 环境变量配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// 数据库操作类
export class DatabaseManager {
    constructor() {
        this.supabase = supabase
    }

    // =============================================
    // 文章相关操作
    // =============================================

    // 获取已发布文章列表
    async getPublishedArticles(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = null,
            tag = null,
            search = null,
            sortBy = 'published_at',
            sortOrder = 'desc'
        } = options

        let query = this.supabase
            .from('article_stats')
            .select('*')
            .eq('status', 'published')

        // 分类筛选
        if (category) {
            query = query.eq('category_name', category)
        }

        // 标签筛选
        if (tag) {
            query = query.contains('tags', [tag])
        }

        // 搜索
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
        }

        // 排序
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // 分页
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
            console.error('获取文章列表失败:', error)
            throw error
        }

        return {
            articles: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }
    }

    // 根据 slug 获取文章详情
    async getArticleBySlug(slug) {
        const { data, error } = await this.supabase
            .from('article_stats')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single()

        if (error) {
            console.error('获取文章详情失败:', error)
            throw error
        }

        // 增加浏览量
        if (data) {
            await this.incrementArticleViews(data.id)
        }

        return data
    }

    // 增加文章浏览量
    async incrementArticleViews(articleId) {
        const { error } = await this.supabase.rpc('increment_article_views', {
            article_id: articleId
        })

        if (error) {
            console.error('更新浏览量失败:', error)
        }
    }

    // 获取热门文章
    async getPopularArticles(limit = 5) {
        const { data, error } = await this.supabase
            .from('popular_articles')
            .select('*')
            .limit(limit)

        if (error) {
            console.error('获取热门文章失败:', error)
            throw error
        }

        return data || []
    }

    // 获取最新文章
    async getRecentArticles(limit = 5) {
        const { data, error } = await this.supabase
            .from('recent_articles')
            .select('*')
            .limit(limit)

        if (error) {
            console.error('获取最新文章失败:', error)
            throw error
        }

        return data || []
    }

    // =============================================
    // 分类相关操作
    // =============================================

    // 获取所有分类
    async getCategories() {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')

        if (error) {
            console.error('获取分类失败:', error)
            throw error
        }

        return data || []
    }

    // =============================================
    // 标签相关操作
    // =============================================

    // 获取热门标签
    async getPopularTags(limit = 20) {
        const { data, error } = await this.supabase
            .from('tags')
            .select('*')
            .gt('usage_count', 0)
            .order('usage_count', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('获取标签失败:', error)
            throw error
        }

        return data || []
    }

    // =============================================
    // 评论相关操作
    // =============================================

    // 获取文章评论
    async getArticleComments(articleId) {
        const { data, error } = await this.supabase
            .from('comments')
            .select(`
                *,
                profiles:user_id (
                    display_name,
                    avatar_url
                )
            `)
            .eq('article_id', articleId)
            .eq('is_approved', true)
            .is('parent_id', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('获取评论失败:', error)
            throw error
        }

        // 获取回复
        for (const comment of data || []) {
            const { data: replies } = await this.supabase
                .from('comments')
                .select(`
                    *,
                    profiles:user_id (
                        display_name,
                        avatar_url
                    )
                `)
                .eq('parent_id', comment.id)
                .eq('is_approved', true)
                .order('created_at')

            comment.replies = replies || []
        }

        return data || []
    }

    // 添加评论
    async addComment(articleId, content, parentId = null) {
        const { data: { user } } = await this.supabase.auth.getUser()
        
        if (!user) {
            throw new Error('用户未登录')
        }

        const { data, error } = await this.supabase
            .from('comments')
            .insert({
                article_id: articleId,
                content: content.trim(),
                user_id: user.id,
                parent_id: parentId
            })
            .select()
            .single()

        if (error) {
            console.error('添加评论失败:', error)
            throw error
        }

        return data
    }

    // =============================================
    // 用户相关操作
    // =============================================

    // 获取当前用户信息
    async getCurrentUser() {
        const { data: { user } } = await this.supabase.auth.getUser()
        
        if (!user) return null

        const { data: profile } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return profile
    }

    // 更新用户资料
    async updateProfile(updates) {
        const { data: { user } } = await this.supabase.auth.getUser()
        
        if (!user) {
            throw new Error('用户未登录')
        }

        const { data, error } = await this.supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

        if (error) {
            console.error('更新用户资料失败:', error)
            throw error
        }

        return data
    }

    // =============================================
    // 网站设置相关操作
    // =============================================

    // 获取公开设置
    async getPublicSettings() {
        const { data, error } = await this.supabase
            .from('site_settings')
            .select('key, value')
            .eq('is_public', true)

        if (error) {
            console.error('获取网站设置失败:', error)
            throw error
        }

        // 转换为对象格式
        const settings = {}
        for (const item of data || []) {
            settings[item.key] = item.value
        }

        return settings
    }

    // =============================================
    // 统计相关操作
    // =============================================

    // 记录页面访问
    async recordPageView(resourceType = 'page', resourceId = null) {
        const sessionId = this.getSessionId()
        
        const { error } = await this.supabase
            .from('analytics')
            .insert({
                event_type: 'page_view',
                resource_type: resourceType,
                resource_id: resourceId,
                session_id: sessionId,
                user_agent: navigator.userAgent,
                referrer: document.referrer
            })

        if (error) {
            console.error('记录访问失败:', error)
        }
    }

    // 获取或生成会话ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id')
        
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            sessionStorage.setItem('session_id', sessionId)
        }
        
        return sessionId
    }

    // =============================================
    // 搜索相关操作
    // =============================================

    // 全文搜索
    async searchContent(query, options = {}) {
        const { limit = 10, type = 'all' } = options

        let searchQuery = this.supabase
            .from('article_stats')
            .select('*')
            .eq('status', 'published')

        if (type === 'title') {
            searchQuery = searchQuery.ilike('title', `%${query}%`)
        } else {
            searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        }

        const { data, error } = await searchQuery
            .order('published_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('搜索失败:', error)
            throw error
        }

        // 记录搜索事件
        await this.recordSearchEvent(query)

        return data || []
    }

    // 记录搜索事件
    async recordSearchEvent(query) {
        const sessionId = this.getSessionId()
        
        const { error } = await this.supabase
            .from('analytics')
            .insert({
                event_type: 'search',
                resource_type: 'search_query',
                session_id: sessionId,
                user_agent: navigator.userAgent
            })

        if (error) {
            console.error('记录搜索事件失败:', error)
        }
    }
}

// 导出数据库管理器实例
export const db = new DatabaseManager()

// 导出认证相关函数
export const auth = {
    // 登录
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error('登录失败:', error)
            throw error
        }

        return data
    },

    // 注册
    async signUp(email, password, userData = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })

        if (error) {
            console.error('注册失败:', error)
            throw error
        }

        return data
    },

    // 登出
    async signOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('登出失败:', error)
            throw error
        }
    },

    // 获取当前用户
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}