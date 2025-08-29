# 江南旅游博客后台管理系统

这是一个基于Node.js和Express的旅游博客后台管理系统，提供文章管理、用户管理、媒体管理和系统设置等功能。

## 功能特点

- 用户认证与授权（JWT）
- 文章的创建、编辑、删除和发布
- 用户管理（管理员、编辑和普通用户）
- 媒体文件上传和管理
- 系统设置管理
- 响应式设计的管理界面

## 技术栈

- **后端**: Node.js, Express.js
- **数据库**: MongoDB (Mongoose ORM)
- **认证**: JSON Web Tokens (JWT)
- **文件上传**: Multer
- **前端**: HTML, CSS, JavaScript (原生)

## 安装指南

### 前提条件

- Node.js (v14+)
- MongoDB

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/jiangnan-travel-blog.git
cd jiangnan-travel-blog
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
创建一个名为`.env`的文件，并添加以下内容：
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/traveltip
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=1000000 # 1MB
```

4. 创建上传目录
```bash
mkdir -p public/uploads/covers
mkdir -p public/uploads/avatars
mkdir -p public/uploads/logo
```

5. 启动服务器
```bash
npm run dev
```

6. 访问管理后台
打开浏览器，访问 `http://localhost:5000/admin.html`

## 初始管理员账户

首次运行系统时，会自动创建一个管理员账户：

- 邮箱: admin@jiangnan.com
- 密码: admin123

**请在首次登录后立即修改密码！**

## API文档

### 认证API

- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/auth/logout` - 退出登录

### 文章API

- `GET /api/blogs` - 获取所有文章
- `GET /api/blogs/:id` - 获取单个文章
- `POST /api/blogs` - 创建新文章
- `PUT /api/blogs/:id` - 更新文章
- `DELETE /api/blogs/:id` - 删除文章
- `PUT /api/blogs/:id/cover` - 上传文章封面

### 用户API

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `PUT /api/users/:id/avatar` - 上传用户头像

### 设置API

- `GET /api/settings` - 获取系统设置
- `PUT /api/settings` - 更新系统设置
- `PUT /api/settings/logo` - 上传网站Logo
- `PUT /api/settings/favicon` - 上传网站图标

## 目录结构

```
jiangnan-travel-blog/
├── config/             # 配置文件
├── controllers/        # 控制器
├── middleware/         # 中间件
├── models/             # 数据模型
├── public/             # 静态文件
│   ├── uploads/        # 上传文件
│   │   ├── avatars/    # 用户头像
│   │   ├── covers/     # 文章封面
│   │   └── logo/       # 网站Logo和图标
├── routes/             # 路由
├── js/                 # 前端JavaScript
├── .env                # 环境变量
├── server.js           # 服务器入口文件
└── README.md           # 项目说明
```

## 许可证

MIT