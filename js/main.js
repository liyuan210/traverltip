// Main JavaScript functionality with module support
import { lazyLoadingManager } from './modules/lazy-loading.js'
import { cdnManager } from './modules/cdn-manager.js'
import { codeSplittingManager } from './modules/code-splitting.js'
import { performanceMonitor } from './modules/performance-monitor.js'

class TravelBlog {
    constructor() {
        this.modules = new Map()
        this.init()
    }

    async init() {
        // 初始化核心模块
        await this.initializeModules()
        
        // 设置基础功能
        this.setupEventListeners()
        this.setupMobileMenu()
        this.initializeLanguage()
        this.setupBreadcrumb()
        
        // 启动性能监控
        this.startPerformanceMonitoring()
    }

    async initializeModules() {
        try {
            // 初始化懒加载管理器
            this.modules.set('lazyLoading', lazyLoadingManager)
            lazyLoadingManager.init()

            // 初始化 CDN 管理器
            this.modules.set('cdn', cdnManager)
            cdnManager.init()

            // 初始化代码分割管理器
            this.modules.set('codeSplitting', codeSplittingManager)
            codeSplittingManager.init()

            // 初始化性能监控
            this.modules.set('performance', performanceMonitor)
            performanceMonitor.init()

            console.log('✅ All modules initialized successfully')
        } catch (error) {
            console.error('❌ Module initialization failed:', error)
        }
    }

    startPerformanceMonitoring() {
        // 监听性能警告
        window.addEventListener('performance-warning', (event) => {
            const { metric, value, threshold } = event.detail
            console.warn(`⚠️ Performance issue: ${metric} (${value}) exceeded threshold (${threshold})`)
            
            // 可以在这里添加用户通知或自动优化逻辑
            this.handlePerformanceIssue(metric, value)
        })
    }

    handlePerformanceIssue(metric, value) {
        switch (metric) {
            case 'LCP':
                // 大内容绘制时间过长，尝试优化图片加载
                this.optimizeImageLoading()
                break
            case 'FID':
                // 首次输入延迟过长，减少 JavaScript 执行
                this.optimizeJavaScriptExecution()
                break
            case 'CLS':
                // 累积布局偏移过大，优化布局稳定性
                this.optimizeLayoutStability()
                break
        }
    }

    optimizeImageLoading() {
        // 切换到更快的 CDN 或降低图片质量
        const cdn = this.modules.get('cdn')
        if (cdn) {
            cdn.switchToNextCDN()
        }
    }

    optimizeJavaScriptExecution() {
        // 延迟非关键 JavaScript 的执行
        const codeSplitting = this.modules.get('codeSplitting')
        if (codeSplitting) {
            codeSplitting.cleanupUnusedModules()
        }
    }

    optimizeLayoutStability() {
        // 为图片添加明确的尺寸
        document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.width = img.naturalWidth
                img.height = img.naturalHeight
            }
        })
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                mobileToggle.setAttribute('aria-expanded', 
                    mobileNav.classList.contains('active'));
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav && !mobileNav.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                mobileNav.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            // Add loading spinner
                            img.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'20\' fill=\'none\' stroke=\'%23d4af37\' stroke-width=\'4\' stroke-dasharray=\'31.416\' stroke-dashoffset=\'31.416\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' dur=\'1s\' repeatCount=\'indefinite\' values=\'0 50 50;360 50 50\'/%3E%3C/circle%3E%3C/svg%3E") center/30px no-repeat';
                            
                            img.src = src;
                            img.removeAttribute('data-src');
                            
                            img.onload = () => {
                                img.style.background = 'none';
                            };
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }

    setupMobileMenu() {
        // Add mobile menu HTML if not exists
        const nav = document.querySelector('nav');
        if (nav && !document.querySelector('.mobile-menu-toggle')) {
            const mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-menu-toggle';
            mobileToggle.innerHTML = '☰';
            mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
            mobileToggle.setAttribute('aria-expanded', 'false');
            
            const mobileNav = document.createElement('div');
            mobileNav.className = 'mobile-nav';
            mobileNav.innerHTML = nav.innerHTML;
            
            nav.parentNode.insertBefore(mobileToggle, nav.nextSibling);
            nav.parentNode.insertBefore(mobileNav, mobileToggle.nextSibling);
        }
    }

    setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                }
            });
            
            observer.observe({entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']});
        }
    }

    setupPreloading() {
        const preloadLinks = [
            {href: 'articles/wuzhen-tour_en.html', as: 'document'},
            {href: 'articles/hangzhou-food.html', as: 'document'},
            {href: 'articles/suzhou-gardens.html', as: 'document'}
        ];
        
        document.querySelectorAll('.read-more').forEach((link, index) => {
            link.addEventListener('mouseenter', () => {
                if (!link.dataset.preloaded && preloadLinks[index]) {
                    const preloadLink = document.createElement('link');
                    preloadLink.rel = 'prefetch';
                    preloadLink.href = preloadLinks[index].href;
                    document.head.appendChild(preloadLink);
                    link.dataset.preloaded = 'true';
                }
            });
        });
    }

    // Force English language; remove dependency on global i18n
    initializeLanguage() {
        document.documentElement.lang = 'en';
        localStorage.setItem('preferredLanguage', 'en');
    }

    setupBreadcrumb() {
        // Add breadcrumb navigation for different pages
        const currentPath = window.location.pathname;
        const breadcrumb = document.querySelector('.breadcrumb');
        
        if (breadcrumb && currentPath !== '/' && currentPath !== '/index.html') {
            // Add current page to breadcrumb
            const currentPageName = this.getCurrentPageName(currentPath);
            if (currentPageName) {
                const listItem = document.createElement('li');
                listItem.className = 'breadcrumb-item';
                listItem.setAttribute('itemprop', 'itemListElement');
                listItem.setAttribute('itemscope', '');
                listItem.setAttribute('itemtype', 'https://schema.org/ListItem');
                
                listItem.innerHTML = `
                    <a href="${currentPath}" itemprop="item">
                        <span itemprop="name">${currentPageName}</span>
                    </a>
                    <meta itemprop="position" content="2" />
                `;
                
                breadcrumb.appendChild(listItem);
            }
        }
    }

    getCurrentPageName(path) {
        const pageNames = {
            '/pricing_en.html': 'Pricing',
            '/pricing.html': 'Pricing',
            '/language.html': 'Price Converter',
            '/login_register_en.html': 'Login/Register',
            '/search.html': 'Search',
            '/articles/': 'Articles'
        };
        
        for (const [pagePath, name] of Object.entries(pageNames)) {
            if (path.includes(pagePath)) {
                return name;
            }
        }
        
        return null;
    }
}

// Enhanced language switching functionality
function changeLanguage() {
    const select = document.getElementById('languageSelect');
    const selectedLanguage = select.value;
    const currentFlag = document.getElementById('currentFlag');
    const selectedOption = select.options[select.selectedIndex];
    
    // Update flag
    if (currentFlag && selectedOption.dataset.flag) {
        currentFlag.src = selectedOption.dataset.flag;
        currentFlag.alt = `${selectedOption.text} flag`;
    }
    
    // Update document language
    document.documentElement.lang = selectedLanguage === 'zh' ? 'zh-CN' : 'en';
    
    // Store preference
    localStorage.setItem('preferredLanguage', selectedLanguage);
    
    // Update page content based on language
    updatePageLanguage(selectedLanguage);
    
    // Navigate to appropriate page if needed
    if (selectedLanguage === 'zh' && !window.location.pathname.includes('jiangnan_website.html')) {
        window.location.href = 'jiangnan_website.html';
    }
}

// Update page content based on selected language
function updatePageLanguage(language) {
    const elements = document.querySelectorAll('[lang]');
    
    elements.forEach(element => {
        const elementLang = element.getAttribute('lang');
        if (language === 'zh' || language === 'zh-CN') {
            element.style.display = elementLang === 'zh-CN' ? 'inline' : 'none';
        } else {
            element.style.display = elementLang === 'en' ? 'inline' : 'none';
        }
    });
    
    // Update breadcrumb for different languages
    updateBreadcrumb(language);
}

// Update breadcrumb based on language
function updateBreadcrumb(language) {
    const breadcrumbHome = document.querySelector('.breadcrumb-item span[itemprop="name"]');
    if (breadcrumbHome) {
        breadcrumbHome.textContent = language === 'zh' || language === 'zh-CN' ? '首页' : 'Home';
    }
}

// Initialize language on page load
function initializeLanguage() {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        languageSelect.value = preferredLanguage;
        changeLanguage();
    }
}

// Admin panel functionality
function showAdmin() {
    document.getElementById('adminPanel').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAdmin() {
    document.getElementById('adminPanel').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function submitBlog(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        alert('Article successfully submitted!');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        closeAdmin();
        event.target.reset();
    }, 2000);
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    new TravelBlog();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TravelBlog;
}