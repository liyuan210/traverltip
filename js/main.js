document.addEventListener('DOMContentLoaded', function() {
    // 检查用户认证状态
    checkAuth();
    
    // 加载精选文章
    loadFeaturedArticles();
    
    // 绑定通讯订阅表单提交事件
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            alert(`感谢订阅！我们会将最新资讯发送到 ${email}`);
            
            // 清空表单
            this.reset();
        });
    }
});

// 加载精选文章
async function loadFeaturedArticles() {
    try {
        const featuredContainer = document.getElementById('featured-articles-container');
        if (!featuredContainer) return;
        
        // 从Supabase获取精选文章
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*, profiles(name)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3);
        
        if (error) {
            console.error('获取精选文章错误:', error);
            return;
        }
        
        // 清空容器
        featuredContainer.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            featuredContainer.innerHTML = '<p>暂无精选游记</p>';
            return;
        }
        
        // 添加文章卡片
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            // 获取文章摘要
            const summary = article.content ? article.content.substring(0, 100) + '...' : '暂无内容';
            
            // 随机选择一个图片URL
            const imageUrls = [
                'https://images.unsplash.com/photo-1598258710957-0e06b4e0ef0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                'https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                'https://images.unsplash.com/photo-1470137430626-983a37b8ea46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
            ];
            const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
            
            card.innerHTML = `
                <div class="article-image">
                    <img src="${randomImageUrl}" alt="${article.title}">
                </div>
                <div class="article-content">
                    <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
                    <div class="article-meta">
                        <span>${article.profiles ? article.profiles.name : '未知作者'}</span>
                        <span>${formatDate(article.created_at)}</span>
                    </div>
                    <p>${summary}</p>
                    <a href="article.html?id=${article.id}" class="btn btn-sm">阅读更多</a>
                </div>
            `;
            
            featuredContainer.appendChild(card);
        });
    } catch (err) {
        console.error('加载精选文章错误:', err);
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}