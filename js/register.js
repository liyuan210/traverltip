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
                showMessage('auth-message', 'Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showMessage('auth-message', 'Please accept the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // 禁用提交按钮，防止重复提交
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';
            
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
                    showMessage('auth-message', error.message || 'Registration failed, please try again later', 'error');
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
                            console.error('Create profile error:', profileError);
                        }
                    }
                    
                    showMessage('auth-message', 'Registration successful! Please check your email to verify.', 'success');
                    
                    // 注册成功后重定向到登录页面
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            } catch (err) {
                console.error('Registration error:', err);
                showMessage('auth-message', 'Registration failed, please try again later', 'error');
            } finally {
                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = 'Register';
            }
        });
    }
});