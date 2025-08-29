// Supabase配置
const SUPABASE_URL = 'https://uhhztcasbbrahnmonthd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHp0Y2FzYmJyYWhubW9udGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzQ4MDgsImV4cCI6MjA3MTk1MDgwOH0.CAQ0zDLah4k6MzxrKFoqjMXCOSnGCjd6iFZOQagDDpA';

// 初始化Supabase客户端
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 检查用户是否已登录
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('获取会话错误:', error);
            updateAuthUI(false);
            return null;
        }
        
        if (session) {
            updateAuthUI(true);
            return session;
        } else {
            updateAuthUI(false);
            return null;
        }
    } catch (err) {
        console.error('检查认证状态错误:', err);
        updateAuthUI(false);
        return null;
    }
}

// 更新认证UI
function updateAuthUI(isLoggedIn) {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'inline-block';
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// 退出登录
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('退出登录错误:', error);
            return false;
        }
        
        updateAuthUI(false);
        window.location.href = 'index.html';
        return true;
    } catch (err) {
        console.error('退出登录错误:', err);
        return false;
    }
}

// 显示消息
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `auth-message ${type}`;
    messageElement.style.display = 'block';
}

// 页面加载时检查认证状态
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 绑定退出登录事件
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// 导出函数
window.checkAuth = checkAuth;
window.updateAuthUI = updateAuthUI;
window.logout = logout;
window.showMessage = showMessage;