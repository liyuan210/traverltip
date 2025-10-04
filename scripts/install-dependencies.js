// 安装新依赖的脚本
const { execSync } = require('child_process');

console.log('🚀 开始安装Supabase和其他必要依赖...\n');

const dependencies = [
  '@supabase/supabase-js',  // Supabase客户端
  'dotenv',                 // 环境变量管理
  'marked',                 // Markdown解析器
  'dompurify',             // HTML清理器
  'date-fns'               // 日期处理库
];

const devDependencies = [
  '@types/node',           // Node.js类型定义
  'nodemon'                // 开发时自动重启
];

try {
  // 安装生产依赖
  console.log('📦 安装生产依赖...');
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  
  // 安装开发依赖
  console.log('\n📦 安装开发依赖...');
  execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'inherit' });
  
  console.log('\n✅ 所有依赖安装完成！');
  console.log('\n📋 已安装的包：');
  console.log('生产依赖：', dependencies.join(', '));
  console.log('开发依赖：', devDependencies.join(', '));
  
} catch (error) {
  console.error('❌ 安装依赖时出错：', error.message);
  process.exit(1);
}