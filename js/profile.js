document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录，如果未登录则重定向到登录页面
    checkAuth().then(session => {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            // 加载用户资料
            loadUserProfile(session.user.id);
            
            // 加载用户的文章和评论
            loadUserArticles(session.user.id);
            loadUserComments(session.user.id);
        }
    });
    
    // 绑定标签页切换事件
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // 更新活动标签按钮
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 显示对应的标签内容
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // 绑定个人资料表单提交事件
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('profile-name').value;
            const bio = document.getElementById('profile-bio').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = '保存中...';
            
            try {
                // 获取当前用户
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    showMessage('profile-message', '您需要登录才能更新个人资料', 'error');
                    return;
                }
                
                // 更新用户资料
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name,
                        bio
                    })
                    .eq('id', session.user.id);
                
                if (error) {
                    showMessage('profile-message', error.message || '更新个人资料失败，请稍后再试', 'error');
                } else {
                    showMessage('profile-message', '个人资料已更新', 'success');
                }
            } catch (err) {
                console.error('更新个人资料错误:', err);
                showMessage('profile-message', '更新个人资料失败，请稍后再试', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '保存更改';
            }
        });
    }
    
    // 绑定修改密码表单提交事件
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // 验证表单
            if (newPassword !== confirmNewPassword) {
                showMessage('profile-message', '两次输入的新密码不一致', 'error');
                return;
            }
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = '更改中...';
            
            try {
                // 更新密码
                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (error) {
                    showMessage('profile-message', error.message || '更改密码失败，请稍后再试', 'error');
                } else {
                    showMessage('profile-message', '密码已更改', 'success');
                    
                    // 清空表单
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-new-password').value = '';
                }
            } catch (err) {
                console.error('更改密码错误:', err);
                showMessage('profile-message', '更改密码失败，请稍后再试', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '更改密码';
            }
        });
    }
});

// 加载用户资料
async function loadUserProfile(userId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('获取用户资料错误:', error);
            return;
        }
        
        if (profile) {
            // 填充表单
            document.getElementById('profile-name').value = profile.name || '';
            document.getElementById('profile-email').value = profile.email || '';
            document.getElementById('profile-bio').value = profile.bio || '';
        }
    } catch (err) {
        console.error('加载用户资料错误:', err);
    }
}

// 加载用户的文章
async function loadUserArticles(userId) {
    try {
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取用户文章错误:', error);
            return;
        }
        
        const articlesContainer = document.getElementById('my-articles-list');
        if (!articlesContainer) return;
        
        articlesContainer.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = '<p>您还没有发布任何游记</p>';
            return;
        }
        
        articles.forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.className = 'article-item';
            articleElement.innerHTML = `
                <h4>${article.title}</h4>
                <div class="article-meta">
                    <span>${formatDate(article.created_at)}</span>
                    <span>${getStatusName(article.status)}</span>
                </div>
                <div class="article-actions">
                    <a href="edit-article.html?id=${article.id}" class="btn btn-sm">编辑</a>
                    <button class="btn btn-sm" data-id="${article.id}" onclick="deleteArticle(${article.id})">删除</button>
                </div>
            `;
            articlesContainer.appendChild(articleElement);
        });
    } catch (err) {
        console.error('加载用户文章错误:', err);
    }
}

// 加载用户的评论
async function loadUserComments(userId) {
    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*, articles(title)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取用户评论错误:', error);
            return;
        }
        
        const commentsContainer = document.getElementById('my-comments-list');
        if (!commentsContainer) return;
        
        commentsContainer.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            commentsContainer.innerHTML = '<p>您还没有发表任何评论</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <p>${comment.content}</p>
                <div class="comment-meta">
                    <span>评论于: ${formatDate(comment.created_at)}</span>
                    <span>文章: <a href="article.html?id=${comment.article_id}">${comment.articles ? comment.articles.title : '未知文章'}</a></span>
                </div>
                <div class="comment-actions">
                    <button class="btn btn-sm" data-id="${comment.id}" onclick="deleteComment(${comment.id})">删除</button>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (err) {
        console.error('加载用户评论错误:', err);
    }
}

// 删除文章
window.deleteArticle = async function(articleId) {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', articleId);
        
        if (error) {
            console.error('删除文章错误:', error);
            showMessage('profile-message', '删除文章失败，请稍后再试', 'error');
        } else {
            showMessage('profile-message', '文章已删除', 'success');
            
            // 重新加载文章列表
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                loadUserArticles(session.user.id);
            }
        }
    } catch (err) {
        console.error('删除文章错误:', err);
        showMessage('profile-message', '删除文章失败，请稍后再试', 'error');
    }
};

// 删除评论
window.deleteComment = async function(commentId) {
    if (!confirm('确定要删除这条评论吗？此操作无法撤销。')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);
        
        if (error) {
            console.error('删除评论错误:', error);
            showMessage('profile-message', '删除评论失败，请稍后再试', 'error');
        } else {
            showMessage('profile-message', '评论已删除', 'success');
            
            // 重新加载评论列表
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                loadUserComments(session.user.id);
            }
        }
    } catch (err) {
        console.error('删除评论错误:', err);
        showMessage('profile-message', '删除评论失败，请稍后再试', 'error');
    }
};

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 获取状态名称
function getStatusName(status) {
    const statuses = {
        'published': '已发布',
        'draft': '草稿'
    };
    
    return statuses[status] || status || '未知';
}