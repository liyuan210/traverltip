// 获取用户角色徽章
function getUserRoleBadge(role) {
    let badgeClass = '';
    let roleName = '';
    
    switch (role) {
        case 'admin':
            badgeClass = 'status-published';
            roleName = '管理员';
            break;
        case 'editor':
            badgeClass = 'status-featured';
            roleName = '编辑';
            break;
        default:
            badgeClass = 'status-draft';
            roleName = '用户';
    }
    
    return `<span class="status ${badgeClass}">${roleName}</span>`;
}

// 添加用户操作事件
function addUserActionEvents() {
    // 编辑用户
    const editButtons = document.querySelectorAll('#usersTableBody .btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    // 删除用户
    const deleteButtons = document.querySelectorAll('#usersTableBody .btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

// 编辑用户
async function editUser(userId) {
    // 切换到用户编辑页面
    showPage('userEdit');
    
    // 显示加载中
    document.getElementById('userEditPage').innerHTML = '<div class="loader"></div>';
    
    // 获取用户数据
    const data = await apiRequest(`users/${userId}`);
    
    if (data && data.success) {
        // 渲染编辑表单
        renderUserEditForm(data.data);
    } else {
        showNotification('获取用户数据失败', 'error');
        showPage('users');
    }
}

// 渲染用户编辑表单
function renderUserEditForm(user) {
    const userEditPage = document.getElementById('userEditPage');
    
    userEditPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">编辑用户</h2>
                <button class="btn" id="saveUserBtn">保存用户</button>
            </div>
            
            <form id="userForm">
                <input type="hidden" id="userId" value="${user._id}">
                
                <div class="form-group">
                    <label class="form-label" for="name">用户名</label>
                    <input type="text" class="form-control" id="name" value="${user.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="email">邮箱</label>
                    <input type="email" class="form-control" id="email" value="${user.email}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="role">角色</label>
                    <select class="form-control" id="role" required>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>用户</option>
                        <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>编辑</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">头像</label>
                    <div class="avatar-preview">
                        <img src="${user.avatar}" alt="用户头像" id="avatarPreview" style="width: 100px; height: 100px; border-radius: 50%;">
                    </div>
                    <input type="file" id="avatar" accept="image/*">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="password">密码</label>
                    <input type="password" class="form-control" id="password" placeholder="留空表示不修改">
                    <small>如果不需要修改密码，请留空</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="confirmPassword">确认密码</label>
                    <input type="password" class="form-control" id="confirmPassword" placeholder="留空表示不修改">
                </div>
            </form>
        </div>
    `;
    
    // 绑定保存按钮事件
    document.getElementById('saveUserBtn').addEventListener('click', saveUser);
    
    // 绑定头像预览
    document.getElementById('avatar').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 保存用户
async function saveUser() {
    const userId = document.getElementById('userId').value;
    
    // 收集表单数据
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };
    
    // 检查是否修改密码
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password) {
        if (password !== confirmPassword) {
            showNotification('两次输入的密码不一致', 'error');
            return;
        }
        formData.password = password;
    }
    
    // 验证必填字段
    if (!formData.name || !formData.email) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 保存用户数据
    const data = await apiRequest(`users/${userId}`, 'PUT', formData);
    
    if (data && data.success) {
        // 处理头像上传
        const avatar = document.getElementById('avatar').files[0];
        if (avatar) {
            await uploadAvatar(userId, avatar);
        }
        
        showNotification('用户保存成功');
        showPage('users');
    } else {
        showNotification(data.message || '用户保存失败', 'error');
    }
}

// 上传头像
async function uploadAvatar(userId, file) {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`/api/users/${userId}/avatar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showNotification('头像上传失败', 'error');
        }
    } catch (err) {
        console.error('头像上传错误:', err);
        showNotification('头像上传失败', 'error');
    }
}

// 删除用户
async function deleteUser(userId) {
    // 确认删除
    const confirmed = await confirmAction('确定要删除这个用户吗？此操作不可撤销。');
    
    if (!confirmed) return;
    
    // 删除用户
    const data = await apiRequest(`users/${userId}`, 'DELETE');
    
    if (data && data.success) {
        showNotification('用户已删除');
        
        // 刷新用户列表
        loadUsers();
    } else {
        showNotification(data.message || '用户删除失败', 'error');
    }
}