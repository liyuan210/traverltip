document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录，如果已登录则重定向到首页
    checkAuth().then(session => {
        if (session) {
            window.location.href = 'index.html';
        }
    });
    
    // 绑定注册表单提交事件
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            const submitButton = this.querySelector('button[type="submit"]');
            
            // 验证表单
            if (password !== confirmPassword) {
                showMessage('auth-message', '两次输入的密码不一致', 'error');
                return;
            }
            
            if (!terms) {
                showMessage('auth-message', '请同意服务条款和隐私政策', 'error');
                return;
            }
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = '注册中...';
            
            try {
                // 使用Supabase注册
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name
                        }
                    }
                });
                
                if (error) {
                    showMessage('auth-message', error.message || '注册失败，请稍后再试', 'error');
                } else {
                    // 创建用户资料
                    if (data.user) {
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .insert([
                                {
                                    id: data.user.id,
                                    name,
                                    email,
                                    role: 'user'
                                }
                            ]);
                        
                        if (profileError) {
                            console.error('创建用户资料错误:', profileError);
                        }
                    }
                    
                    showMessage('auth-message', '注册成功！请检查您的邮箱进行验证。', 'success');
                    
                    // 注册成功后重定向到登录页面
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            } catch (err) {
                console.error('注册错误:', err);
                showMessage('auth-message', '注册失败，请稍后再试', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '注册';
            }
        });
    }
});