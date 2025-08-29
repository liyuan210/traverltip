// 加载用户列表
async function loadUsers() {
    const usersPage = document.getElementById('usersPage');
    
    // 显示加载中
    usersPage.innerHTML = '<div class="loader"></div>';
    
    // 获取用户数据
    const data = await apiRequest('users');
    
    if (data && data.success) {
        // 渲染用户列表
        renderUsersList(data.data, data.pagination);
    } else {
        usersPage.innerHTML = '<p>加载用户失败</p>';
    }
}

// 渲染用户列表
function renderUsersList(users, pagination) {
    const usersPage = document.getElementById('usersPage');
    
    usersPage.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">用户管理</h2>
                <button class="btn" id="newUserBtn">新建用户</button>
            </div>
            
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>邮箱</th>
                            <th>角色</th>
                            <th>注册日期</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                    </tbody>
                </table>
            </div>
            
            <div class="pagination" id="usersPagination">
            </div>
        </div>
    `;
    
    // 填充用户数据
    const tableBody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">暂无用户</td></tr>';
    } else {
        users.forEach(user => {
            const date = new Date(user.createdAt);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center;">
                        <img src="${user.avatar}" alt="${user.name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
                        ${user.name}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${getUserRoleBadge(user.role)}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <a href="#" class="btn-icon btn-edit" data-id="${user._id}"><i class="fas fa-edit"></i></a>
                        <a href="#" class="btn-icon btn-delete" data-id="${user._id}"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // 添加用户操作事件
    addUserActionEvents();
    
    // 添加新建用户按钮事件
    document.getElementById('newUserBtn').addEventListener('click', createNewUser);
    
    // 渲染分页
    if (pagination) {
        renderPagination(pagination, 'usersPagination', loadUsersPage);
    }
}