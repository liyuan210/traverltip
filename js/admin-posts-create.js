// 创建新文章
function createNewArticle() {
    // 切换到文章编辑页面
    showPage('articleEdit');
    
    // 渲染新文章表单
    renderNewArticleForm();
}

// 渲染新文章表单
function renderNewArticleForm() {
    const articleEditPage = document.getElementById('articleEditPage');
    
    articleEditPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">新建文章</h2>
                <button class="btn" id="createArticleBtn">发布文章</button>
            </div>
            
            <form id="articleForm">
                <div class="form-group">
                    <label class="form-label" for="title">标题</label>
                    <input type="text" class="form-control" id="title" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="excerpt">摘要</label>
                    <textarea class="form-control" id="excerpt" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="category">分类</label>
                    <select class="form-control" id="category" required>
                        <option value="景点游览">景点游览</option>
                        <option value="美食探索">美食探索</option>
                        <option value="文化体验">文化体验</option>
                        <option value="住宿推荐">住宿推荐</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="content">内容</label>
                    <textarea class="form-control" id="content" rows="15" required></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tags">标签</label>
                    <input type="text" class="form-control" id="tags">
                    <small>多个标签用逗号分隔</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">封面图片</label>
                    <div class="cover-preview">
                        <img src="/uploads/covers/default-cover.jpg" alt="封面图片" id="coverPreview">
                    </div>
                    <input type="file" id="coverImage" accept="image/*">
                </div>
                
                <div class="form-group">
                    <label class="form-label">发布状态</label>
                    <div class="form-check">
                        <input type="checkbox" id="published">
                        <label for="published">发布</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">特色文章</label>
                    <div class="form-check">
                        <input type="checkbox" id="featured">
                        <label for="featured">设为特色</label>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    // 绑定创建按钮事件
    document.getElementById('createArticleBtn').addEventListener('click', createArticle);
    
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

// 创建文章
async function createArticle() {
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
    
    // 创建文章
    const data = await apiRequest('blogs', 'POST', formData);
    
    if (data && data.success) {
        // 处理封面图片上传
        const coverImage = document.getElementById('coverImage').files[0];
        if (coverImage) {
            await uploadCoverImage(data.data._id, coverImage);
        }
        
        showNotification('文章创建成功');
        showPage('articles');
    } else {
        showNotification('文章创建失败', 'error');
    }
}

// 加载指定页码的文章
async function loadArticlesPage(page) {
    // 显示加载中
    document.getElementById('articlesTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center;"><div class="loader"></div></td></tr>';
    
    // 获取文章数据
    const data = await apiRequest(`blogs?page=${page}`);
    
    if (data && data.success) {
        // 更新文章列表
        const tableBody = document.getElementById('articlesTableBody');
        tableBody.innerHTML = '';
        
        if (data.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">暂无文章</td></tr>';
        } else {
            data.data.forEach(article => {
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
        
        // 更新分页
        if (data.pagination) {
            updatePagination(data.pagination, 'articlesPagination', loadArticlesPage);
        }
    } else {
        document.getElementById('articlesTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center;">加载文章失败</td></tr>';
    }
}

// 渲染分页
function renderPagination(pagination, containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // 上一页按钮
    if (pagination.prev) {
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-button';
        prevButton.innerHTML = '&lt;';
        prevButton.addEventListener('click', () => callback(pagination.prev.page));
        container.appendChild(prevButton);
    }
    
    // 页码按钮
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = pagination.page;
    
    // 显示最多5个页码按钮
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                callback(i);
            }
        });
        container.appendChild(pageButton);
    }
    
    // 下一页按钮
    if (pagination.next) {
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-button';
        nextButton.innerHTML = '&gt;';
        nextButton.addEventListener('click', () => callback(pagination.next.page));
        container.appendChild(nextButton);
    }
}

// 更新分页
function updatePagination(pagination, containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 清空当前分页
    container.innerHTML = '';
    
    // 重新渲染分页
    renderPagination(pagination, containerId, callback);
}