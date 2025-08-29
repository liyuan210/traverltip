const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供文章标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, '请提供文章内容']
  },
  excerpt: {
    type: String,
    required: [true, '请提供文章摘要'],
    maxlength: [200, '摘要不能超过200个字符']
  },
  category: {
    type: String,
    required: [true, '请选择文章分类'],
    enum: ['景点游览', '美食探索', '文化体验', '住宿推荐', '其他']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String,
    city: String,
    province: String
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建文章slug
ArticleSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
  }
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);