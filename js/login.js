document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录，如果已登录则重定向到首页
    checkAuth().then(session => {
        if (session) {
            window.location.href = 'index.html';
        }
    });
    
    // 绑定登录表单提交事件
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = '登录中...';
            
            try {
                // 使用Supabase登录
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) {
                    showMessage('auth-message', error.message || '登录失败，请检查邮箱和密码', 'error');
                } else {
                    showMessage('auth-message', '登录成功！正在跳转...', 'success');
                    
                    // 登录成功后重定向到首页
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }
            } catch (err) {
                console.error('登录错误:', err);
                showMessage('auth-message', '登录失败，请稍后再试', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '登录';
            }
        });
    }
});