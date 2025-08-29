const Article = require('../models/Article');
const path = require('path');
const fs = require('fs');

// @desc    获取所有文章
// @route   GET /api/blogs
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    let query;

    // 复制req.query
    const reqQuery = { ...req.query };

    // 排除的字段
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // 从query中删除这些字段
    removeFields.forEach(param => delete reqQuery[param]);

    // 创建查询字符串
    let queryStr = JSON.stringify(reqQuery);

    // 创建操作符 ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // 查找文章
    query = Article.find(JSON.parse(queryStr)).populate({
      path: 'author',
      select: 'name avatar'
    });

    // 选择字段
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // 排序
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Article.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // 执行查询
    const articles = await query;

    // 分页结果
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: articles.length,
      pagination,
      data: articles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    获取单个文章
// @route   GET /api/blogs/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate({
      path: 'author',
      select: 'name avatar'
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '未找到文章'
      });
    }

    // 增加浏览次数
    article.viewCount += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    创建文章
// @route   POST /api/blogs
// @access  Private
exports.createArticle = async (req, res) => {
  try {
    // 添加用户到请求体
    req.body.author = req.user.id;

    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    更新文章
// @route   PUT /api/blogs/:id
// @access  Private
exports.updateArticle = async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '未找到文章'
      });
    }

    // 确保用户是文章作者或管理员
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: '未授权更新此文章'
      });
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    删除文章
// @route   DELETE /api/blogs/:id
// @access  Private
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '未找到文章'
      });
    }

    // 确保用户是文章作者或管理员
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: '未授权删除此文章'
      });
    }

    await article.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// @desc    上传文章封面图片
// @route   PUT /api/blogs/:id/cover
// @access  Private
exports.uploadCover = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '未找到文章'
      });
    }

    // 确保用户是文章作者或管理员
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: '未授权更新此文章'
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const file = req.files.file;

    // 确保文件是图片
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: '请上传图片文件'
      });
    }

    // 检查文件大小
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return res.status(400).json({
        success: false,
        message: `请上传小于${process.env.MAX_FILE_UPLOAD}的图片`
      });
    }

    // 创建自定义文件名
    file.name = `cover_${article._id}${path.parse(file.name).ext}`;

    // 移动文件
    file.mv(`${process.env.FILE_UPLOAD_PATH}/covers/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: '文件上传失败'
        });
      }

      // 更新数据库
      await Article.findByIdAndUpdate(req.params.id, { coverImage: file.name });

      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};