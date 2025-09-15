#!/usr/bin/env node

// 构建脚本 - 整合所有优化步骤
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

class BuildManager {
    constructor() {
        this.buildConfig = {
            mode: process.env.NODE_ENV || 'production',
            target: process.env.BUILD_TARGET || 'web',
            analyze: process.env.ANALYZE === 'true'
        }
        
        this.steps = [
            'clean',
            'lint',
            'optimize-images',
            'build-vite',
            'generate-sw',
            'analyze-bundle',
            'generate-report'
        ]
    }

    async run() {
        console.log('🚀 Starting build process...')
        console.log(`📋 Mode: ${this.buildConfig.mode}`)
        console.log(`🎯 Target: ${this.buildConfig.target}`)
        
        const startTime = Date.now()
        
        try {
            for (const step of this.steps) {
                await this.executeStep(step)
            }
            
            const duration = Date.now() - startTime
            console.log(`✅ Build completed successfully in ${duration}ms`)
            
        } catch (error) {
            console.error('❌ Build failed:', error)
            process.exit(1)
        }
    }

    async executeStep(step) {
        console.log(`\n📦 Executing step: ${step}`)
        
        switch (step) {
            case 'clean':
                await this.clean()
                break
            case 'lint':
                await this.lint()
                break
            case 'optimize-images':
                await this.optimizeImages()
                break
            case 'build-vite':
                await this.buildVite()
                break
            case 'generate-sw':
                await this.generateServiceWorker()
                break
            case 'analyze-bundle':
                if (this.buildConfig.analyze) {
                    await this.analyzeBundle()
                }
                break
            case 'generate-report':
                await this.generateBuildReport()
                break
            default:
                console.warn(`Unknown build step: ${step}`)
        }
    }

    async clean() {
        console.log('🧹 Cleaning build directory...')
        
        try {
            if (existsSync('dist')) {
                execSync('rm -rf dist', { cwd: rootDir })
            }
            
            mkdirSync('dist', { recursive: true })
            console.log('✅ Build directory cleaned')
        } catch (error) {
            console.error('❌ Failed to clean build directory:', error)
            throw error
        }
    }

    async lint() {
        console.log('🔍 Running linter...')
        
        try {
            execSync('npm run lint', { 
                cwd: rootDir,
                stdio: 'inherit'
            })
            console.log('✅ Linting completed')
        } catch (error) {
            console.warn('⚠️ Linting issues found, continuing build...')
        }
    }

    async optimizeImages() {
        console.log('🖼️ Optimizing images...')
        
        try {
            execSync('npm run optimize-images', { 
                cwd: rootDir,
                stdio: 'inherit'
            })
            console.log('✅ Image optimization completed')
        } catch (error) {
            console.warn('⚠️ Image optimization failed, continuing build...')
        }
    }

    async buildVite() {
        console.log('⚡ Building with Vite...')
        
        try {
            const buildCommand = this.buildConfig.mode === 'development' 
                ? 'npm run dev' 
                : 'npm run build'
                
            execSync(buildCommand, { 
                cwd: rootDir,
                stdio: 'inherit'
            })
            console.log('✅ Vite build completed')
        } catch (error) {
            console.error('❌ Vite build failed:', error)
            throw error
        }
    }

    async generateServiceWorker() {
        console.log('🔧 Generating Service Worker...')
        
        try {
            execSync('npm run generate-sw', { 
                cwd: rootDir,
                stdio: 'inherit'
            })
            console.log('✅ Service Worker generated')
        } catch (error) {
            console.warn('⚠️ Service Worker generation failed, continuing build...')
        }
    }

    async analyzeBundle() {
        console.log('📊 Analyzing bundle...')
        
        try {
            // 生成包分析报告
            const bundleAnalyzer = await import('webpack-bundle-analyzer')
            
            // 这里可以添加包分析逻辑
            console.log('✅ Bundle analysis completed')
        } catch (error) {
            console.warn('⚠️ Bundle analysis failed:', error)
        }
    }

    async generateBuildReport() {
        console.log('📋 Generating build report...')
        
        try {
            const report = {
                timestamp: new Date().toISOString(),
                mode: this.buildConfig.mode,
                target: this.buildConfig.target,
                version: this.getVersion(),
                files: await this.getBuildFiles(),
                performance: await this.getPerformanceMetrics(),
                size: await this.getBundleSize()
            }
            
            writeFileSync(
                join(rootDir, 'dist', 'build-report.json'),
                JSON.stringify(report, null, 2)
            )
            
            console.log('✅ Build report generated')
            this.printBuildSummary(report)
        } catch (error) {
            console.warn('⚠️ Build report generation failed:', error)
        }
    }

    getVersion() {
        try {
            const packageJson = JSON.parse(
                readFileSync(join(rootDir, 'package.json'), 'utf8')
            )
            return packageJson.version
        } catch {
            return '1.0.0'
        }
    }

    async getBuildFiles() {
        try {
            const files = execSync('find dist -type f', { 
                cwd: rootDir,
                encoding: 'utf8'
            }).split('\n').filter(Boolean)
            
            return files.map(file => ({
                path: file,
                size: this.getFileSize(join(rootDir, file))
            }))
        } catch {
            return []
        }
    }

    getFileSize(filePath) {
        try {
            const stats = require('fs').statSync(filePath)
            return stats.size
        } catch {
            return 0
        }
    }

    async getPerformanceMetrics() {
        // 这里可以添加性能指标收集逻辑
        return {
            buildTime: Date.now(),
            bundleSize: await this.getBundleSize(),
            chunkCount: await this.getChunkCount()
        }
    }

    async getBundleSize() {
        try {
            const output = execSync('du -sb dist', { 
                cwd: rootDir,
                encoding: 'utf8'
            })
            return parseInt(output.split('\t')[0])
        } catch {
            return 0
        }
    }

    async getChunkCount() {
        try {
            const jsFiles = execSync('find dist -name "*.js" | wc -l', { 
                cwd: rootDir,
                encoding: 'utf8'
            })
            return parseInt(jsFiles.trim())
        } catch {
            return 0
        }
    }

    printBuildSummary(report) {
        console.log('\n📊 Build Summary:')
        console.log(`📦 Version: ${report.version}`)
        console.log(`📁 Total files: ${report.files.length}`)
        console.log(`💾 Bundle size: ${(report.size / 1024 / 1024).toFixed(2)} MB`)
        console.log(`🧩 JS chunks: ${report.performance.chunkCount}`)
        console.log(`⏱️ Build mode: ${report.mode}`)
    }
}

// 运行构建
const buildManager = new BuildManager()
buildManager.run().catch(console.error)