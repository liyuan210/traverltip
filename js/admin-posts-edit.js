// 保存文章
async function saveArticle() {
    const articleId = document.getElementById('articleId').value;
    
    // 收集表单数据
    const formData = {
        title: document.getElementById('title').value,
        excerpt: document.getElementById('excerpt').value,
        category: document.getElementById('category').value,
        content: document.getElementById('content').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        published: document.getElementById('published').checked,
        featured: document.getElementById('featured').checked
    };
    
    // 验证必填字段
    if (!formData.title || !formData.excerpt || !formData.content) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 保存文章数据
    const data = await apiRequest(`blogs/${articleId}`, 'PUT', formData);
    
    if (data && data.success) {
        // 处理封面图片上传
        const coverImage = document.getElementById('coverImage').files[0];
        if (coverImage) {
            await uploadCoverImage(articleId, coverImage);
        }
        
        showNotification('文章保存成功');
        showPage('articles');
    } else {
        showNotification('文章保存失败', 'error');
    }
}

// 上传封面图片
async function uploadCoverImage(articleId, file) {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`/api/blogs/${articleId}/cover`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showNotification('封面图片上传失败', 'error');
        }
    } catch (err) {
        console.error('封面图片上传错误:', err);
        showNotification('封面图片上传失败', 'error');
    }
}

// 删除文章
async function deleteArticle(articleId) {
    // 确认删除
    const confirmed = await confirmAction('确定要删除这篇文章吗？此操作不可撤销。');
    
    if (!confirmed) return;
    
    // 删除文章
    const data = await apiRequest(`blogs/${articleId}`, 'DELETE');
    
    if (data && data.success) {
        showNotification('文章已删除');
        
        // 刷新当前页面数据
        const currentPage = document.querySelector('.menu-item.active').getAttribute('data-page');
        showPage(currentPage);
    } else {
        showNotification('文章删除失败', 'error');
    }
}

// 加载文章列表
async function loadArticles() {
    const articlesPage = document.getElementById('articlesPage');
    
    // 显示加载中
    articlesPage.innerHTML = '<div class="loader"></div>';
    
    // 获取文章数据
    const data = await apiRequest('blogs');
    
    if (data && data.success) {
        // 渲染文章列表
        renderArticlesList(data.data, data.pagination);
    } else {
        articlesPage.innerHTML = '<p>加载文章失败</p>';
    }
}

// 渲染文章列表
function renderArticlesList(articles, pagination) {
    const articlesPage = document.getElementById('articlesPage');
    
    articlesPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">文章管理</h2>
                <button class="btn" id="newArticleBtn">新建文章</button>
            </div>
            
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>标题</th>
                            <th>分类</th>
                            <th>发布日期</th>
                            <th>状态</th>
                            <th>浏览量</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="articlesTableBody">
                    </tbody>
                </table>
            </div>
            
            <div class="pagination" id="articlesPagination">
            </div>
        </div>
    `;
    
    // 填充文章数据
    const tableBody = document.getElementById('articlesTableBody');
    
    if (articles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">暂无文章</td></tr>';
    } else {
        articles.forEach(article => {
            const date = new Date(article.createdAt);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${article.title}</td>
                <td>${article.category}</td>
                <td>${formattedDate}</td>
                <td><span class="status status-${article.published ? 'published' : 'draft'}">${article.published ? '已发布' : '草稿'}</span></td>
                <td>${article.viewCount}</td>
                <td>
                    <div class="action-buttons">
                        <a href="#" class="btn-icon btn-view" data-id="${article._id}"><i class="fas fa-eye"></i></a>
                        <a href="#" class="btn-icon btn-edit" data-id="${article._id}"><i class="fas fa-edit"></i></a>
                        <a href="#" class="btn-icon btn-delete" data-id="${article._id}"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // 添加文章操作事件
    addArticleActionEvents();
    
    // 添加新建文章按钮事件
    document.getElementById('newArticleBtn').addEventListener('click', createNewArticle);
    
    // 渲染分页
    if (pagination) {
        renderPagination(pagination, 'articlesPagination', loadArticlesPage);
    }
}