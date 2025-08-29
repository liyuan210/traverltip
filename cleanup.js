const fs = require('fs');
const path = require('path');

// 核心文件列表 - 这些文件将被保留
const coreFiles = [
    // 主网站文件
    'jiangnan_website.html',
    'jiangnan_website_en.html',
    'login_register.html',
    'supabase-admin.html',
    'sw.js',
    'index.html',
    'search.html',
    'pricing.html',
    'language.html',
    'admin.html',
    'admin-dashboard.html',
    
    // 配置文件
    'package.json',
    '.env',
    '.gitattributes',
    'README.md',
    'supabase-tables.sql'
];

// 核心目录列表 - 这些目录将被保留
const coreDirs = [
    'articles',
    'css',
    'js',
    '.git',
    '.codebuddy'
];

// 要删除的文件 - 这些是临时文件或部分文件
const filesToDelete = [
    // 部分文件
    'jiangnan_website_with_auth_part1.html',
    'jiangnan_website_with_auth_part2.html',
    'jiangnan_website_with_auth_part3.html',
    'jiangnan_website_with_auth_part4.html',
    'jiangnan_website_with_auth_part5.html',
    'jiangnan_website_with_auth_part6.html',
    'jiangnan_website_with_auth_improved_part1.html',
    'jiangnan_website_with_auth_improved_part2.html',
    'jiangnan_website_with_auth_improved_part3.html',
    'jiangnan_website_with_auth_improved_part4.html',
    'jiangnan_website_with_auth_improved_part5.html',
    'supabase-admin-part1.html',
    'supabase-admin-part2.html',
    'supabase-admin-part3.html',
    'supabase-admin-part4.html',
    'supabase-admin-part5.html',
    'supabase-admin-part6.html',
    'supabase-admin-part7.html',
    'supabase-admin-part8.html',
    'supabase-admin-part9.html',
    
    // 合并脚本
    'merge_auth_website.js',
    'merge_improved_auth_website.js',
    'merge-supabase-admin.js',
    
    // 重复的认证文件 (因为我们有login_register.html)
    'login.html',
    'register.html',
    'forgot-password.html',
    'profile.html',
    
    // 测试文件
    'test-login.js',
    'simple-login-server.js',
    
    // 重复的完整文件 (因为我们保留了最终版本)
    'jiangnan_website_with_auth.html',
    'jiangnan_website_with_auth_improved.html'
];

// 要删除的目录 - 这些是不再需要的目录
const dirsToDelete = [
    'config',
    'controllers',
    'middleware',
    'models',
    'public',
    'routes',
    'node_modules'
];

// 删除文件
console.log('开始清理不必要的文件...');
filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`已删除: ${file}`);
        } catch (err) {
            console.error(`删除 ${file} 失败:`, err);
        }
    } else {
        console.log(`文件不存在: ${file}`);
    }
});

// 删除目录
console.log('\n开始清理不必要的目录...');
dirsToDelete.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        try {
            // 注意：这只会删除空目录，如果需要递归删除非空目录，需要使用更复杂的逻辑
            fs.rmdirSync(dirPath);
            console.log(`已删除目录: ${dir}`);
        } catch (err) {
            console.log(`目录 ${dir} 可能不为空，需要手动删除`);
        }
    } else {
        console.log(`目录不存在: ${dir}`);
    }
});

console.log('\n清理完成！保留了所有核心文件和目录。');
console.log('保留的核心文件:');
coreFiles.forEach(file => console.log(`- ${file}`));
console.log('\n保留的核心目录:');
coreDirs.forEach(dir => console.log(`- ${dir}`));