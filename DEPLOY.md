# Vercel部署说明

## 重新部署步骤

1. 删除现有的Vercel项目
2. 推送代码到GitHub
3. 在Vercel中导入新项目

## 项目配置
- 项目类型：静态网站
- 根目录：/
- 构建命令：留空
- 输出目录：留空

## 文件结构
```
/
├── index.html (主页)
├── articles/ (文章目录)
├── css/ (样式文件)
├── js/ (脚本文件)
└── vercel.json (部署配置)
```

## 重要文件
- index.html: 网站主页
- articles/: 包含所有博客文章
- vercel.json: 最简配置，只包含版本号