document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录，如果已登录则重定向到首页
    checkAuth().then(session => {
        if (session) {
            window.location.href = 'index.html';
        }
    });
    
    // 绑定忘记密码表单提交事件
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = '发送中...';
            
            try {
                // 使用Supabase发送重置密码邮件
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                
                if (error) {
                    showMessage('auth-message', error.message || '发送重置链接失败，请稍后再试', 'error');
                } else {
                    showMessage('auth-message', '重置链接已发送到您的邮箱，请查收。', 'success');
                    
                    // 清空表单
                    document.getElementById('email').value = '';
                }
            } catch (err) {
                console.error('重置密码错误:', err);
                showMessage('auth-message', '发送重置链接失败，请稍后再试', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '发送重置链接';
            }
        });
    }
});