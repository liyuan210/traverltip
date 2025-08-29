// 加载系统设置
async function loadSettings() {
    const settingsPage = document.getElementById('settingsPage');
    
    // 显示加载中
    settingsPage.innerHTML = '<div class="loader"></div>';
    
    // 获取设置数据
    const data = await apiRequest('settings');
    
    if (data && data.success) {
        // 渲染设置表单
        renderSettingsForm(data.data);
    } else {
        settingsPage.innerHTML = '<p>加载设置失败</p>';
    }
}

// 渲染设置表单
function renderSettingsForm(settings) {
    const settingsPage = document.getElementById('settingsPage');
    
    settingsPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">系统设置</h2>
                <button class="btn" id="saveSettingsBtn">保存设置</button>
            </div>
            
            <form id="settingsForm">
                <div class="form-group">
                    <label class="form-label" for="siteName">网站名称</label>
                    <input type="text" class="form-control" id="siteName" value="${settings.siteName || '江南旅游博客'}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="siteDescription">网站描述</label>
                    <textarea class="form-control" id="siteDescription" rows="3">${settings.siteDescription || '探索江南水乡的美丽风景和独特文化'}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="contactEmail">联系邮箱</label>
                    <input type="email" class="form-control" id="contactEmail" value="${settings.contactEmail || 'contact@jiangnan.com'}">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="footerText">页脚文本</label>
                    <input type="text" class="form-control" id="footerText" value="${settings.footerText || '© 2023 江南旅游博客 版权所有'}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">网站Logo</label>
                    <div class="logo-preview">
                        <img src="${settings.logo || '/uploads/logo/default-logo.png'}" alt="网站Logo" id="logoPreview" style="max-height: 100px;">
                    </div>
                    <input type="file" id="logo" accept="image/*">
                </div>
                
                <div class="form-group">
                    <label class="form-label">网站图标</label>
                    <div class="favicon-preview">
                        <img src="${settings.favicon || '/uploads/logo/favicon.ico'}" alt="网站图标" id="faviconPreview" style="max-height: 32px;">
                    </div>
                    <input type="file" id="favicon" accept="image/*">
                </div>
                
                <hr style="margin: 30px 0;">
                
                <h3 style="margin-bottom: 20px;">社交媒体链接</h3>
                
                <div class="form-group">
                    <label class="form-label" for="wechat">微信公众号</label>
                    <input type="text" class="form-control" id="wechat" value="${settings.socialMedia?.wechat || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="weibo">微博</label>
                    <input type="text" class="form-control" id="weibo" value="${settings.socialMedia?.weibo || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="douyin">抖音</label>
                    <input type="text" class="form-control" id="douyin" value="${settings.socialMedia?.douyin || ''}">
                </div>
                
                <hr style="margin: 30px 0;">
                
                <h3 style="margin-bottom: 20px;">高级设置</h3>
                
                <div class="form-group">
                    <label class="form-label" for="articlesPerPage">每页文章数量</label>
                    <input type="number" class="form-control" id="articlesPerPage" value="${settings.articlesPerPage || 10}" min="1" max="50">
                </div>
                
                <div class="form-group">
                    <label class="form-label">评论设置</label>
                    <div class="form-check">
                        <input type="checkbox" id="enableComments" ${settings.enableComments ? 'checked' : ''}>
                        <label for="enableComments">启用评论功能</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">注册设置</label>
                    <div class="form-check">
                        <input type="checkbox" id="enableRegistration" ${settings.enableRegistration ? 'checked' : ''}>
                        <label for="enableRegistration">允许新用户注册</label>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    // 绑定保存按钮事件
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // 绑定Logo预览
    document.getElementById('logo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('logoPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 绑定图标预览
    document.getElementById('favicon').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('faviconPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 保存设置
async function saveSettings() {
    // 收集表单数据
    const formData = {
        siteName: document.getElementById('siteName').value,
        siteDescription: document.getElementById('siteDescription').value,
        contactEmail: document.getElementById('contactEmail').value,
        footerText: document.getElementById('footerText').value,
        articlesPerPage: parseInt(document.getElementById('articlesPerPage').value),
        enableComments: document.getElementById('enableComments').checked,
        enableRegistration: document.getElementById('enableRegistration').checked,
        socialMedia: {
            wechat: document.getElementById('wechat').value,
            weibo: document.getElementById('weibo').value,
            douyin: document.getElementById('douyin').value
        }
    };
    
    // 验证必填字段
    if (!formData.siteName) {
        showNotification('请填写网站名称', 'error');
        return;
    }
    
    // 保存设置数据
    const data = await apiRequest('settings', 'PUT', formData);
    
    if (data && data.success) {
        // 处理Logo上传
        const logo = document.getElementById('logo').files[0];
        if (logo) {
            await uploadLogo(logo);
        }
        
        // 处理图标上传
        const favicon = document.getElementById('favicon').files[0];
        if (favicon) {
            await uploadFavicon(favicon);
        }
        
        showNotification('设置保存成功');
    } else {
        showNotification('设置保存失败', 'error');
    }
}

// 上传Logo
async function uploadLogo(file) {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/settings/logo', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showNotification('Logo上传失败', 'error');
        }
    } catch (err) {
        console.error('Logo上传错误:', err);
        showNotification('Logo上传失败', 'error');
    }
}

// 上传图标
async function uploadFavicon(file) {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/settings/favicon', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showNotification('图标上传失败', 'error');
        }
    } catch (err) {
        console.error('图标上传错误:', err);
        showNotification('图标上传失败', 'error');
    }
}