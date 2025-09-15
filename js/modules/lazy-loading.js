// 懒加载模块 - 按需加载
export class LazyLoadingManager {
    constructor() {
        this.observer = null
        this.loadedModules = new Set()
        this.pendingModules = new Map()
        this.config = {
            rootMargin: '50px',
            threshold: 0.1,
            enableIntersectionObserver: 'IntersectionObserver' in window
        }
    }

    init() {
        this.setupImageLazyLoading()
        this.setupModuleLazyLoading()
        this.setupContentLazyLoading()
        console.log('✅ Lazy loading manager initialized')
    }

    // 图片懒加载
    setupImageLazyLoading() {
        if (!this.config.enableIntersectionObserver) {
            this.fallbackImageLoading()
            return
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target)
                    this.observer.unobserve(entry.target)
                }
            })
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        })

        // 观察所有懒加载图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img)
        })
    }

    // 加载图片
    loadImage(img) {
        const src = img.dataset.src
        const srcset = img.dataset.srcset

        if (src) {
            // 创建新图片对象预加载
            const newImg = new Image()
            
            newImg.onload = () => {
                img.src = src
                if (srcset) img.srcset = srcset
                img.classList.add('loaded')
                img.removeAttribute('data-src')
                img.removeAttribute('data-srcset')
            }
            
            newImg.onerror = () => {
                img.classList.add('error')
                console.warn(`Failed to load image: ${src}`)
            }
            
            newImg.src = src
        }
    }

    // 降级图片加载
    fallbackImageLoading() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img)
        })
    }

    // 模块懒加载
    setupModuleLazyLoading() {
        // 监听路由变化或用户交互
        this.setupRouteBasedLoading()
        this.setupInteractionBasedLoading()
    }

    // 基于路由的懒加载
    setupRouteBasedLoading() {
        // 监听 hash 变化
        window.addEventListener('hashchange', () => {
            this.loadModuleForRoute(window.location.hash)
        })

        // 监听 popstate
        window.addEventListener('popstate', () => {
            this.loadModuleForRoute(window.location.pathname)
        })
    }

    // 基于交互的懒加载
    setupInteractionBasedLoading() {
        // 管理员面板懒加载
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-admin-trigger]')) {
                this.loadModule('admin-panel')
            }
            
            if (event.target.matches('[data-search-trigger]')) {
                this.loadModule('search')
            }
            
            if (event.target.matches('[data-comments-trigger]')) {
                this.loadModule('comments')
            }
        })

        // 鼠标悬停预加载
        document.addEventListener('mouseenter', (event) => {
            if (event.target.matches('[data-preload-module]')) {
                const moduleName = event.target.dataset.preloadModule
                this.preloadModule(moduleName)
            }
        }, true)
    }

    // 根据路由加载模块
    async loadModuleForRoute(route) {
        const moduleMap = {
            '#admin': 'admin-panel',
            '#search': 'search',
            '/articles': 'article-list',
            '/about': 'about-page'
        }

        const moduleName = moduleMap[route]
        if (moduleName && !this.loadedModules.has(moduleName)) {
            await this.loadModule(moduleName)
        }
    }

    // 动态加载模块
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return this.pendingModules.get(moduleName)
        }

        console.log(`🔄 Loading module: ${moduleName}`)
        
        try {
            const modulePromise = this.importModule(moduleName)
            this.pendingModules.set(moduleName, modulePromise)
            
            const module = await modulePromise
            this.loadedModules.add(moduleName)
            this.pendingModules.delete(moduleName)
            
            console.log(`✅ Module loaded: ${moduleName}`)
            return module
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error)
            this.pendingModules.delete(moduleName)
            throw error
        }
    }

    // 预加载模块
    async preloadModule(moduleName) {
        if (!this.loadedModules.has(moduleName) && !this.pendingModules.has(moduleName)) {
            // 使用 requestIdleCallback 在空闲时预加载
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this.loadModule(moduleName)
                })
            } else {
                setTimeout(() => {
                    this.loadModule(moduleName)
                }, 100)
            }
        }
    }

    // 导入模块
    async importModule(moduleName) {
        const moduleMap = {
            'admin-panel': () => import('./admin-panel.js'),
            'search': () => import('./search.js'),
            'comments': () => import('./comments.js'),
            'article-list': () => import('./article-list.js'),
            'about-page': () => import('./about-page.js'),
            'gallery': () => import('./gallery.js'),
            'contact-form': () => import('./contact-form.js')
        }

        const importFn = moduleMap[moduleName]
        if (!importFn) {
            throw new Error(`Unknown module: ${moduleName}`)
        }

        return await importFn()
    }

    // 内容懒加载
    setupContentLazyLoading() {
        // 懒加载文章内容
        this.setupArticleLazyLoading()
        
        // 懒加载评论
        this.setupCommentsLazyLoading()
        
        // 懒加载相关文章
        this.setupRelatedArticlesLoading()
    }

    // 文章懒加载
    setupArticleLazyLoading() {
        const articleContainers = document.querySelectorAll('[data-lazy-article]')
        
        if (this.observer) {
            articleContainers.forEach(container => {
                this.observer.observe(container)
            })
        }
    }

    // 评论懒加载
    setupCommentsLazyLoading() {
        const commentsSection = document.querySelector('#comments-section')
        
        if (commentsSection && this.observer) {
            this.observer.observe(commentsSection)
        }
    }

    // 相关文章懒加载
    setupRelatedArticlesLoading() {
        const relatedSection = document.querySelector('#related-articles')
        
        if (relatedSection && this.observer) {
            this.observer.observe(relatedSection)
        }
    }

    // 清理未使用的模块
    cleanupUnusedModules() {
        // 获取当前页面需要的模块
        const currentRoute = window.location.pathname + window.location.hash
        const requiredModules = this.getRequiredModulesForRoute(currentRoute)
        
        // 卸载不需要的模块
        for (const moduleName of this.loadedModules) {
            if (!requiredModules.includes(moduleName)) {
                this.unloadModule(moduleName)
            }
        }
    }

    // 获取路由所需模块
    getRequiredModulesForRoute(route) {
        const routeModules = {
            '/': ['article-list'],
            '/admin': ['admin-panel'],
            '/search': ['search'],
            '/about': ['about-page']
        }

        return routeModules[route] || []
    }

    // 卸载模块
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            this.loadedModules.delete(moduleName)
            console.log(`🗑️ Module unloaded: ${moduleName}`)
            
            // 触发垃圾回收提示
            if ('gc' in window && typeof window.gc === 'function') {
                window.gc()
            }
        }
    }

    // 获取加载统计
    getLoadingStats() {
        return {
            loadedModules: Array.from(this.loadedModules),
            pendingModules: Array.from(this.pendingModules.keys()),
            totalModules: this.loadedModules.size + this.pendingModules.size
        }
    }

    // 销毁懒加载管理器
    destroy() {
        if (this.observer) {
            this.observer.disconnect()
            this.observer = null
        }
        
        this.loadedModules.clear()
        this.pendingModules.clear()
    }
}

// 导出单例
export const lazyLoadingManager = new LazyLoadingManager()