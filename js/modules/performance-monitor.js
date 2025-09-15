// 性能监控模块
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map()
        this.observers = new Map()
        this.thresholds = {
            FCP: 1800, // First Contentful Paint
            LCP: 2500, // Largest Contentful Paint
            FID: 100,  // First Input Delay
            CLS: 0.1   // Cumulative Layout Shift
        }
        this.reportEndpoint = '/api/performance'
    }

    init() {
        this.setupCoreWebVitals()
        this.setupResourceTiming()
        this.setupNavigationTiming()
        this.setupCustomMetrics()
        this.startReporting()
    }

    // 核心 Web 指标监控
    setupCoreWebVitals() {
        // First Contentful Paint
        this.observePerformanceEntry('paint', (entries) => {
            entries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    this.recordMetric('FCP', entry.startTime)
                }
            })
        })

        // Largest Contentful Paint
        this.observePerformanceEntry('largest-contentful-paint', (entries) => {
            entries.forEach(entry => {
                this.recordMetric('LCP', entry.startTime)
            })
        })

        // First Input Delay
        this.observePerformanceEntry('first-input', (entries) => {
            entries.forEach(entry => {
                this.recordMetric('FID', entry.processingStart - entry.startTime)
            })
        })

        // Cumulative Layout Shift
        this.observePerformanceEntry('layout-shift', (entries) => {
            let clsValue = 0
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value
                }
            })
            this.recordMetric('CLS', clsValue)
        })
    }

    // 观察性能条目
    observePerformanceEntry(type, callback) {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    callback(list.getEntries())
                })
                
                observer.observe({ entryTypes: [type] })
                this.observers.set(type, observer)
            } catch (error) {
                console.warn(`Failed to observe ${type}:`, error)
            }
        }
    }

    // 记录指标
    recordMetric(name, value, metadata = {}) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: this.getConnectionInfo(),
            ...metadata
        }

        this.metrics.set(`${name}-${Date.now()}`, metric)
        
        // 检查阈值
        this.checkThreshold(name, value)
        
        console.log(`Performance metric: ${name} = ${value}`)
    }

    // 获取连接信息
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            }
        }
        return null
    }

    // 检查阈值
    checkThreshold(name, value) {
        const threshold = this.thresholds[name]
        
        if (threshold && value > threshold) {
            console.warn(`Performance threshold exceeded: ${name} = ${value} (threshold: ${threshold})`)
            
            // 触发性能警告事件
            window.dispatchEvent(new CustomEvent('performance-warning', {
                detail: { metric: name, value, threshold }
            }))
        }
    }

    // 资源加载时间监控
    setupResourceTiming() {
        this.observePerformanceEntry('resource', (entries) => {
            entries.forEach(entry => {
                const resourceType = this.getResourceType(entry.name)
                const loadTime = entry.responseEnd - entry.startTime
                
                this.recordResourceMetric(resourceType, {
                    url: entry.name,
                    loadTime: loadTime,
                    size: entry.transferSize || 0,
                    cached: entry.transferSize === 0 && entry.decodedBodySize > 0
                })
            })
        })
    }

    // 导航时间监控
    setupNavigationTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0]
            
            if (navigation) {
                this.recordMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart)
                this.recordMetric('TCP', navigation.connectEnd - navigation.connectStart)
                this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart)
                this.recordMetric('DOMLoad', navigation.domContentLoadedEventEnd - navigation.navigationStart)
                this.recordMetric('WindowLoad', navigation.loadEventEnd - navigation.navigationStart)
            }
        })
    }

    // 自定义性能指标
    setupCustomMetrics() {
        this.measureTimeToInteractive()
        this.measureInteractionLatency()
        this.measureMemoryUsage()
    }

    // 测量页面可交互时间
    measureTimeToInteractive() {
        let startTime = performance.now()
        
        const checkInteractive = () => {
            if (document.readyState === 'complete') {
                const tti = performance.now() - startTime
                this.recordMetric('TTI', tti)
            } else {
                requestAnimationFrame(checkInteractive)
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkInteractive)
        } else {
            checkInteractive()
        }
    }

    // 测量交互延迟
    measureInteractionLatency() {
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now()
                
                requestAnimationFrame(() => {
                    const latency = performance.now() - startTime
                    this.recordMetric(`Interaction-${eventType}`, latency)
                })
            }, { passive: true })
        })
    }

    // 测量内存使用
    measureMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory
                this.recordMetric('MemoryUsed', memory.usedJSHeapSize)
                this.recordMetric('MemoryTotal', memory.totalJSHeapSize)
            }, 30000) // 每30秒记录一次
        }
    }

    // 获取资源类型
    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif'].includes(extension)) {
            return 'image'
        } else if (['css'].includes(extension)) {
            return 'stylesheet'
        } else if (['js'].includes(extension)) {
            return 'script'
        } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
            return 'font'
        } else {
            return 'other'
        }
    }

    // 记录资源指标
    recordResourceMetric(type, data) {
        const existing = this.metrics.get(`resource-${type}`) || []
        existing.push({
            ...data,
            timestamp: Date.now()
        })
        
        this.metrics.set(`resource-${type}`, existing)
    }

    // 开始性能报告
    startReporting() {
        // 页面卸载时发送报告
        window.addEventListener('beforeunload', () => {
            this.sendReport()
        })

        // 定期发送报告
        setInterval(() => {
            this.sendReport()
        }, 60000) // 每分钟发送一次
    }

    // 发送性能报告
    async sendReport() {
        if (this.metrics.size === 0) return

        const report = {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: Object.fromEntries(this.metrics),
            connection: this.getConnectionInfo(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }

        try {
            // 使用 sendBeacon 确保数据发送
            if ('sendBeacon' in navigator) {
                navigator.sendBeacon(this.reportEndpoint, JSON.stringify(report))
            } else {
                // 降级到 fetch
                fetch(this.reportEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report),
                    keepalive: true
                })
            }
            
            // 清空已发送的指标
            this.metrics.clear()
        } catch (error) {
            console.warn('Failed to send performance report:', error)
        }
    }

    // 获取性能摘要
    getPerformanceSummary() {
        const summary = {
            coreWebVitals: {},
            resourceTiming: {},
            customMetrics: {}
        }

        for (const [key, metric] of this.metrics.entries()) {
            if (['FCP', 'LCP', 'FID', 'CLS'].includes(metric.name)) {
                summary.coreWebVitals[metric.name] = metric.value
            } else if (key.startsWith('resource-')) {
                summary.resourceTiming[metric.name] = metric.value
            } else {
                summary.customMetrics[metric.name] = metric.value
            }
        }

        return summary
    }

    // 清理资源
    destroy() {
        for (const observer of this.observers.values()) {
            observer.disconnect()
        }
        this.observers.clear()
        this.metrics.clear()
    }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()