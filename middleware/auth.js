const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由中间件
exports.protect = async (req, res, next) => {
  let token;

  // 检查请求头中是否有token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 获取用户信息
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }
};

// 授权角色中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }
    next();
  };
};