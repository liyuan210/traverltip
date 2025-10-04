// 测试Supabase连接
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('🧪 测试Supabase连接...');
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    console.log('📋 配置信息:');
    console.log('URL:', url);
    console.log('Key前20字符:', key ? key.substring(0, 20) + '...' : '未设置');
    console.log('Key长度:', key ? key.length : 0);
    
    if (!url || !key) {
        console.error('❌ 缺少环境变量配置');
        return;
    }
    
    try {
        const supabase = createClient(url, key);
        
        // 测试简单查询
        console.log('🔗 尝试连接数据库...');
        const { data, error } = await supabase
            .from('categories')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ 连接失败:', error);
            
            // 提供解决方案
            console.log('\n💡 可能的解决方案:');
            console.log('1. 检查API密钥是否正确');
            console.log('2. 确认项目URL是否正确');
            console.log('3. 检查RLS策略是否阻止了访问');
            console.log('4. 尝试使用service_role密钥（仅用于测试）');
            
        } else {
            console.log('✅ 数据库连接成功！');
            console.log('📊 返回数据:', data);
            
            // 测试查询分类表
            const { data: categories, error: catError } = await supabase
                .from('categories')
                .select('*')
                .limit(3);
                
            if (catError) {
                console.error('❌ 查询分类失败:', catError);
            } else {
                console.log('📂 分类数据:', categories);
            }
        }
        
    } catch (err) {
        console.error('❌ 连接过程中发生错误:', err);
    }
}

testConnection();