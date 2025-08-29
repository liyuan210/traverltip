// 获取用户信息
async function fetchUserInfo() {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateUserInfo(data.data);
        } else {
            // Token可能已过期
            logout();
        }
    } catch (err) {
        console.error('获取用户信息错误:', err);
    }
}

// 更新用户信息显示
function updateUserInfo(user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    const userAvatarElement = document.querySelector('.user-avatar');
    if (userAvatarElement && user.avatar) {
        userAvatarElement.src = user.avatar;
    }
}

// 加载仪表盘数据
async function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    try {
        const response = await fetch('/api/stats/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.data);
            updateRecentArticles(data.data.recentArticles);
        }
    } catch (err) {
        console.error('加载仪表盘数据错误:', err);
    }
}

// 更新仪表盘统计数据
function updateDashboardStats(stats) {
    const cardValues = document.querySelectorAll('.card-value');
    
    if (cardValues.length >= 4) {
        cardValues[0].textContent = stats.articleCount || 0;
        cardValues[1].textContent = stats.totalViews || 0;
        cardValues[2].textContent = stats.userCount || 0;
        cardValues[3].textContent = stats.commentCount || 0;
    }
}

// 显示指定页面
function showPage(pageName) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示指定页面
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // 根据页面类型加载数据
        switch(pageName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'articles':
                loadArticles();
                break;
            case 'users':
                loadUsers();
                break;
            case 'media':
                loadMedia();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
}

// 通用API请求函数
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        logout();
        return null;
    }
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const data = await response.json();
        
        if (response.status === 401) {
            // 未授权，可能是token过期
            logout();
            return null;
        }
        
        return data;
    } catch (err) {
        console.error(`API请求错误 (${endpoint}):`, err);
        return { success: false, message: '请求失败，请稍后再试' };
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 确认对话框
function confirmAction(message) {
    return new Promise((resolve) => {
        // 创建确认对话框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">确认操作</h3>
                    <span class="close">&times;</span>
                </div>
                <p>${message}</p>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelBtn">取消</button>
                    <button class="btn" id="confirmBtn">确认</button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 显示对话框
        modal.style.display = 'block';
        
        // 绑定事件
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('#cancelBtn');
        const confirmBtn = modal.querySelector('#confirmBtn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
            resolve(false);
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
            resolve(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
            resolve(true);
        });
    });
}