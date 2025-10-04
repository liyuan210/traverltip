# 江南旅游攻略网站 - 设置指南

## 项目概述
这是一个现代化的旅游攻略网站，专注于江南地区的旅游信息。网站采用 Supabase + 静态前端的架构，提供中英双语支持和现代化的用户体验。

## 🌟 主要功能
- 📱 响应式设计，支持移动端和桌面端
- 🌍 中英双语支持
- 🔍 智能搜索和筛选
- 📊 文章浏览统计
- 👨‍💼 管理后台
- 🚀 高性能和SEO优化

## 📋 设置步骤

### 1. 数据库设置 (Supabase)
您已经注册了 Supabase 账号，现在需要：

1. 登录到 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入您的项目：`hqpcnflogdhcqddipaso`
3. 点击左侧菜单的 "SQL Editor"
4. 执行 `scripts/create-tables.sql` 中的SQL代码来创建数据表

### 2. 安装依赖
```bash
npm install @supabase/supabase-js marked dompurify
```

### 3. 环境配置
`.env` 文件已经创建，包含您的 Supabase 配置：
- SUPABASE_URL: https://hqpcnflogdhcqddipaso.supabase.co
- SUPABASE_ANON_KEY: [您的API密钥]

### 4. 数据迁移
运行以下命令将现有文章迁移到数据库：
```bash
node scripts/migrate-articles.js
```

### 5. 启动开发服务器
```bash
# 使用 Python (推荐)
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000

# 或使用 PHP
php -S localhost:8000
```

## 📁 项目结构

```
traveltip/
├── admin/                  # 管理后台
│   ├── index.html         # 管理后台主页
│   └── login.html         # 登录页面
├── articles/              # 文章页面
├── config/                # 配置文件
│   └── supabase.js       # Supabase配置
├── css/                   # 样式文件
├── images/                # 图片资源
├── js/                    # JavaScript模块
│   ├── modules/          # 功能模块
│   │   ├── supabase-client.js    # 数据库客户端
│   │   ├── search.js             # 搜索功能
│   │   ├── homepage.js           # 首页管理
│   │   ├── language-switcher.js  # 语言切换
│   │   └── admin.js              # 管理后台
│   └── app.js            # 主应用入口
├── scripts/              # 脚本文件
│   ├── create-tables.sql # 数据库建表脚本
│   └── migrate-articles.js # 数据迁移脚本
├── .env                  # 环境变量
└── package.json          # 项目配置
```

## 🔧 核心模块说明

### 1. Supabase客户端 (`js/modules/supabase-client.js`)
- 数据库连接和API调用
- 文章CRUD操作
- 搜索和统计功能

### 2. 搜索模块 (`js/modules/search.js`)
- 实时搜索建议
- 多条件筛选
- 搜索历史记录

### 3. 首页管理 (`js/modules/homepage.js`)
- 动态内容加载
- 精选文章展示
- 统计数据显示

### 4. 语言切换 (`js/modules/language-switcher.js`)
- 中英文切换
- URL重定向
- 本地化存储

### 5. 管理后台 (`js/modules/admin.js`)
- 用户认证
- 文章管理
- 数据统计
- 系统监控

## 🎯 使用指南

### 管理后台访问
1. 访问：`http://localhost:8000/admin/login.html`
2. 使用演示账号登录：
   - 用户名：`admin`
   - 密码：`admin123`

### 文章管理
- **创建文章**：在管理后台点击"创建文章"
- **编辑文章**：在文章列表中点击"编辑"
- **删除文章**：在文章列表中点击"删除"

### 搜索功能
- 支持标题、内容、城市、分类搜索
- 实时搜索建议
- 高级筛选选项

## 🚀 部署建议

### 1. 静态托管 (推荐)
- **Vercel**: 免费，支持自动部署
- **Netlify**: 免费，支持表单处理
- **GitHub Pages**: 免费，与GitHub集成

### 2. 服务器部署
- **域名绑定**：配置自定义域名
- **HTTPS证书**：使用 Let's Encrypt
- **CDN加速**：使用 Cloudflare

### 3. 数据库优化
- **索引优化**：已在建表脚本中配置
- **RLS策略**：已配置行级安全策略
- **备份策略**：定期导出数据备份

## 📊 性能优化

### 1. 前端优化
- 图片懒加载
- CSS/JS代码压缩
- 浏览器缓存配置

### 2. 数据库优化
- 查询索引优化
- 分页加载
- 缓存策略

### 3. SEO优化
- 语义化HTML结构
- Meta标签优化
- 结构化数据标记

## 🔒 安全配置

### 1. 数据库安全
- RLS (Row Level Security) 已启用
- API密钥权限限制
- 输入数据验证

### 2. 前端安全
- XSS防护 (使用DOMPurify)
- CSRF防护
- 内容安全策略

## 📈 监控和分析

### 1. 访问统计
- 文章浏览量统计
- 搜索关键词统计
- 用户行为分析

### 2. 性能监控
- 页面加载时间
- API响应时间
- 错误日志记录

## 🆘 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `.env` 文件配置
   - 验证 Supabase 项目状态
   - 检查网络连接

2. **文章不显示**
   - 确认数据迁移是否成功
   - 检查文章发布状态
   - 查看浏览器控制台错误

3. **搜索功能异常**
   - 检查数据库索引
   - 验证搜索API调用
   - 清理浏览器缓存

4. **管理后台无法访问**
   - 检查登录凭据
   - 清理localStorage
   - 验证文件路径

## 📞 技术支持

如果您在设置过程中遇到问题，请：

1. 检查浏览器控制台的错误信息
2. 查看Supabase dashboard的日志
3. 确认所有依赖都已正确安装
4. 验证环境变量配置

## 🔄 更新日志

### v1.0.0 (当前版本)
- ✅ 完整的Supabase集成
- ✅ 响应式设计
- ✅ 中英双语支持
- ✅ 管理后台功能
- ✅ 搜索和筛选功能
- ✅ SEO优化

### 计划功能
- 🔄 用户评论系统
- 🔄 社交媒体集成
- 🔄 邮件订阅功能
- 🔄 移动端PWA支持

---

**祝您使用愉快！** 🎉