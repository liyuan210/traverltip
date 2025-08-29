document.addEventListener('DOMContentLoaded', function() {
    console.log('管理页面加载完成');
    
    // 检查用户是否已登录
    checkAuth();

    // 菜单项点击事件
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.id !== 'logoutBtn') {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                if (page) {
                    showPage(page);
                    // 更新活动菜单项
                    menuItems.forEach(mi => mi.classList.remove('active'));
                    this.classList.add('active');
                    // 更新标题
                    document.querySelector('.header h1').textContent = this.querySelector('span').textContent;
                }
            });
        }
    });

    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('找到登录表单，添加提交事件');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    } else {
        console.warn('未找到登录表单');
    }
});

// 检查用户是否已登录
function checkAuth() {
    console.log('检查用户登录状态');
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('未找到token，显示登录页面');
        // 未登录，显示登录页面
        const loginPage = document.getElementById('loginPage');
        const adminPage = document.getElementById('adminPage');
        
        if (loginPage && adminPage) {
            loginPage.style.display = 'block';
            adminPage.style.display = 'none';
        } else {
            console.error('未找到loginPage或adminPage元素');
        }
    } else {
        console.log('找到token，显示管理页面');
        // 已登录，显示管理页面
        const loginPage = document.getElementById('loginPage');
        const adminPage = document.getElementById('adminPage');
        
        if (loginPage && adminPage) {
            loginPage.style.display = 'none';
            adminPage.style.display = 'flex';
            
            // 获取用户信息
            fetchUserInfo();
            
            // 加载仪表盘数据
            loadDashboardData();
        } else {
            console.error('未找到loginPage或adminPage元素');
        }
    }
}

// 登录函数
async function login() {
    console.log('执行登录函数');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log(`尝试登录: ${email}`);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('登录请求已发送，状态码:', response.status);
        
        const data = await response.json();
        console.log('登录响应:', data);
        
        if (data.success) {
            console.log('登录成功，保存token');
            // 保存token到本地存储
            localStorage.setItem('token', data.token);
            
            // 显示管理页面
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminPage').style.display = 'flex';
            
            // 更新用户信息
            updateUserInfo(data.user);
            
            // 加载仪表盘数据
            loadDashboardData();
        } else {
            console.error('登录失败:', data.message);
            alert(data.message || '登录失败，请检查邮箱和密码');
        }
    } catch (err) {
        console.error('登录错误:', err);
        alert('登录失败，请稍后再试');
    }
}

// 退出登录函数
function logout() {
    console.log('执行退出登录');
    // 清除本地存储的token
    localStorage.removeItem('token');
    
    // 显示登录页面
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
}

// 这些函数可能在其他JS文件中定义，这里添加空实现以避免错误
function fetchUserInfo() {
    console.log('获取用户信息');
    // 实现在admin-core.js中
}

function updateUserInfo(user) {
    console.log('更新用户信息:', user);
    // 实现在admin-core.js中
}

function loadDashboardData() {
    console.log('加载仪表盘数据');
    // 实现在admin-core.js中
}

function showPage(pageName) {
    console.log('显示页面:', pageName);
    // 实现在admin-core.js中
}