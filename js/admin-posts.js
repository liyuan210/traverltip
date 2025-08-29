// 更新最近文章列表
function updateRecentArticles(articles) {
    const tableBody = document.querySelector('#dashboardPage table tbody');
    
    if (!tableBody || !articles || articles.length === 0) return;
    
    tableBody.innerHTML = '';
    
    articles.forEach(article => {
        const row = document.createElement('tr');
        
        const date = new Date(article.createdAt);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
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
    
    // 添加文章操作事件
    addArticleActionEvents();
}

// 添加文章操作事件
function addArticleActionEvents() {
    // 查看文章
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-id');
            viewArticle(articleId);
        });
    });
    
    // 编辑文章
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-id');
            editArticle(articleId);
        });
    });
    
    // 删除文章
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-id');
            deleteArticle(articleId);
        });
    });
}

// 查看文章
function viewArticle(articleId) {
    window.open(`/articles/${articleId}`, '_blank');
}

// 编辑文章
async function editArticle(articleId) {
    // 切换到文章编辑页面
    showPage('articleEdit');
    
    // 显示加载中
    document.getElementById('articleEditPage').innerHTML = '<div class="loader"></div>';
    
    // 获取文章数据
    const data = await apiRequest(`blogs/${articleId}`);
    
    if (data && data.success) {
        // 渲染编辑表单
        renderArticleEditForm(data.data);
    } else {
        showNotification('获取文章数据失败', 'error');
        showPage('articles');
    }
}

// 渲染文章编辑表单
function renderArticleEditForm(article) {
    const articleEditPage = document.getElementById('articleEditPage');
    
    articleEditPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">编辑文章</h2>
                <button class="btn" id="saveArticleBtn">保存文章</button>
            </div>
            
            <form id="articleForm">
                <input type="hidden" id="articleId" value="${article._id}">
                
                <div class="form-group">
                    <label class="form-label" for="title">标题</label>
                    <input type="text" class="form-control" id="title" value="${article.title}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="excerpt">摘要</label>
                    <textarea class="form-control" id="excerpt" rows="3" required>${article.excerpt}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="category">分类</label>
                    <select class="form-control" id="category" required>
                        <option value="景点游览" ${article.category === '景点游览' ? 'selected' : ''}>景点游览</option>
                        <option value="美食探索" ${article.category === '美食探索' ? 'selected' : ''}>美食探索</option>
                        <option value="文化体验" ${article.category === '文化体验' ? 'selected' : ''}>文化体验</option>
                        <option value="住宿推荐" ${article.category === '住宿推荐' ? 'selected' : ''}>住宿推荐</option>
                        <option value="其他" ${article.category === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="content">内容</label>
                    <textarea class="form-control" id="content" rows="15" required>${article.content}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tags">标签</label>
                    <input type="text" class="form-control" id="tags" value="${article.tags ? article.tags.join(', ') : ''}">
                    <small>多个标签用逗号分隔</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">封面图片</label>
                    <div class="cover-preview">
                        <img src="/uploads/covers/${article.coverImage}" alt="封面图片" id="coverPreview">
                    </div>
                    <input type="file" id="coverImage" accept="image/*">
                </div>
                
                <div class="form-group">
                    <label class="form-label">发布状态</label>
                    <div class="form-check">
                        <input type="checkbox" id="published" ${article.published ? 'checked' : ''}>
                        <label for="published">发布</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">特色文章</label>
                    <div class="form-check">
                        <input type="checkbox" id="featured" ${article.featured ? 'checked' : ''}>
                        <label for="featured">设为特色</label>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    // 绑定保存按钮事件
    document.getElementById('saveArticleBtn').addEventListener('click', saveArticle);
    
    // 绑定封面图片预览
    document.getElementById('coverImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('coverPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}