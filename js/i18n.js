// Internationalization (i18n) Support
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.blog': 'Travel Blog',
                'nav.pricing': 'Pricing',
                'nav.converter': 'Price Converter',
                'nav.login': 'Login/Register',
                'nav.admin': 'Admin',
                
                // Hero Section
                'hero.title': 'Welcome to Jiangnan Travel Blog',
                'hero.description': 'Discover the poetic charm of Jiangnan, a region where ancient water towns, exquisite gardens, and culinary delights await. Follow our journey through the enchanting landscapes of southern China, where tradition and modernity blend seamlessly.',
                'hero.latest': 'Latest Articles',
                'hero.search': 'Search Content',
                
                // Blog Section
                'blog.title': 'Latest Travel Stories',
                'blog.readmore': 'Read More →',
                'blog.featured': 'FEATURED',
                
                // Pricing Section
                'pricing.title': 'Travel Packages',
                'pricing.free.title': 'Complimentary Travel Guides',
                'pricing.free.description': 'Access our collection of free travel itineraries covering the most enchanting destinations across the Jiangnan region.',
                'pricing.learn': 'Learn More →',
                
                // Footer
                'footer.copyright': '© 2023 Jiangnan Travel Blog. All Rights Reserved.',
                
                // Admin Panel
                'admin.title': 'Upload New Article',
                'admin.article.title': 'Article Title',
                'admin.article.date': 'Publication Date',
                'admin.article.image': 'Image URL',
                'admin.article.excerpt': 'Article Excerpt',
                'admin.article.content': 'Article Content',
                'admin.submit': 'Submit Article',
                'admin.success': 'Article successfully submitted!',
                
                // Breadcrumb
                'breadcrumb.home': 'Home',
                'breadcrumb.pricing': 'Pricing',
                'breadcrumb.converter': 'Price Converter',
                'breadcrumb.login': 'Login/Register',
                'breadcrumb.search': 'Search',
                'breadcrumb.articles': 'Articles'
            },
            'zh-CN': {
                // Navigation
                'nav.home': '首页',
                'nav.blog': '旅游博客',
                'nav.pricing': '价格',
                'nav.converter': '价格转换器',
                'nav.login': '登录/注册',
                'nav.admin': '管理',
                
                // Hero Section
                'hero.title': '欢迎来到江南旅游博客',
                'hero.description': '探索江南的诗意魅力，这里有古老的水乡、精美的园林和美味佳肴等待着您。跟随我们的脚步，穿越中国南方迷人的风景，感受传统与现代的完美融合。',
                'hero.latest': '最新文章',
                'hero.search': '搜索内容',
                
                // Blog Section
                'blog.title': '最新旅游故事',
                'blog.readmore': '阅读更多 →',
                'blog.featured': '精选',
                
                // Pricing Section
                'pricing.title': '旅游套餐',
                'pricing.free.title': '免费旅游指南',
                'pricing.free.description': '访问我们的免费旅游行程集合，涵盖江南地区最迷人的目的地。',
                'pricing.learn': '了解更多 →',
                
                // Footer
                'footer.copyright': '© 2023 江南旅游博客。保留所有权利。',
                
                // Admin Panel
                'admin.title': '上传新文章',
                'admin.article.title': '文章标题',
                'admin.article.date': '发布日期',
                'admin.article.image': '图片链接',
                'admin.article.excerpt': '文章摘要',
                'admin.article.content': '文章内容',
                'admin.submit': '提交文章',
                'admin.success': '文章提交成功！',
                
                // Breadcrumb
                'breadcrumb.home': '首页',
                'breadcrumb.pricing': '价格',
                'breadcrumb.converter': '价格转换器',
                'breadcrumb.login': '登录/注册',
                'breadcrumb.search': '搜索',
                'breadcrumb.articles': '文章'
            }
        };
        
        this.init();
    }
    
    init() {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const storedLang = localStorage.getItem('preferredLanguage');
        
        // Set initial language
        this.currentLanguage = storedLang || (browserLang.startsWith('zh') ? 'zh-CN' : 'en');
        
        // Apply translations
        this.applyTranslations();
    }
    
    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('preferredLanguage', language);
        this.applyTranslations();
        
        // Update document language
        document.documentElement.lang = language;
        
        // Update meta tags
        this.updateMetaTags(language);
    }
    
    translate(key) {
        const translation = this.translations[this.currentLanguage];
        return translation && translation[key] ? translation[key] : key;
    }
    
    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update page title
        const titleKey = document.querySelector('meta[name="title-key"]');
        if (titleKey) {
            document.title = this.translate(titleKey.content);
        }
    }
    
    updateMetaTags(language) {
        // Update Open Graph locale
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) {
            ogLocale.content = language === 'zh-CN' ? 'zh_CN' : 'en_US';
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = language;
        
        // Update hreflang links
        this.updateHreflangLinks(language);
    }
    
    updateHreflangLinks(language) {
        // Remove existing hreflang links
        const existingLinks = document.querySelectorAll('link[hreflang]');
        existingLinks.forEach(link => link.remove());
        
        // Add new hreflang links
        const languages = [
            { code: 'en', url: 'https://jiangnan-travel.com/' },
            { code: 'zh-CN', url: 'https://jiangnan-travel.com/zh/' },
            { code: 'x-default', url: 'https://jiangnan-travel.com/' }
        ];
        
        languages.forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang.code;
            link.href = lang.url;
            document.head.appendChild(link);
        });
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
} else {
    window.I18nManager = I18nManager;
}