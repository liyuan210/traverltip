const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 创建初始管理员账户
const createInitialAdmin = async () => {
  try {
    // 检查是否已存在管理员账户
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('创建初始管理员账户...');
      
      // 创建密码哈希
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // 创建管理员用户
      await User.create({
        name: '管理员',
        email: 'admin@jiangnan.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('初始管理员账户创建成功！');
      console.log('邮箱: admin@jiangnan.com');
      console.log('密码: admin123');
    } else {
      console.log('管理员账户已存在，跳过初始化。');
    }
  } catch (err) {
    console.error('创建初始管理员账户失败:', err);
  }
};

module.exports = createInitialAdmin;