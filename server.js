const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// 导入初始化管理员账户函数
const createInitialAdmin = require('./config/initAdmin');

// 初始化Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 文件上传中间件
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_UPLOAD || 1000000 }, // 默认1MB
  createParentPath: true
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/media', require('./routes/media'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/stats', require('./routes/stats'));

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/traveltip', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB连接成功');
  
  // 创建初始管理员账户
  createInitialAdmin();
})
.catch(err => console.error('MongoDB连接失败:', err));

// 端口设置
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));