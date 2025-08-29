// 初始化富文本编辑器
function initEditor() {
    try {
        if (typeof Quill !== 'undefined') {
            editor = new Quill('#editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
            
            // 同步编辑器内容到隐藏的textarea
            editor.on('text-change', function() {
                document.getElementById('blogContent').value = editor.root.innerHTML;
            });
        } else {
            console.warn('Quill编辑器未加载，使用基本文本区域代替');
            // 如果Quill不可用，使用普通textarea
            const editorDiv = document.getElementById('editor');
            const textarea = document.getElementById('blogContent');
            
            if (editorDiv && textarea) {
                editorDiv.style.display = 'none';
                textarea.style.display = 'block';
                textarea.style.width = '100%';
                textarea.style.height = '300px';
                textarea.style.padding = '10px';
                textarea.style.border = '1px solid #ddd';
                textarea.style.borderRadius = '4px';
            }
        }
    } catch (error) {
        console.error('初始化编辑器失败:', error);
    }
}

function showSection(sectionId) {
    // 隐藏所有部分
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 移除所有导航项的活动状态
    document.querySelectorAll('.admin-sidebar nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // 显示选定部分
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(`nav-${sectionId}`).classList.add('active');
    
    // 加载相应部分的数据
    if (sectionId === 'posts') {
        loadPosts();
    } else if (sectionId === 'media') {
        loadMedia();
    } else if (sectionId === 'users') {
        loadUsers();
    } else if (sectionId === 'settings') {
        loadSettings();
    }
}

function logout() {
    // 清除认证信息
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

// 加载仪表盘统计数据
function loadDashboardStats() {
    const token = localStorage.getItem('authToken');
    
    // 加载文章统计
    fetch('/api/stats/posts', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(stats => {
        const statsHtml = `
            <p>总文章数: ${stats.total}</p>
            <p>已发布: ${stats.published}</p>
            <p>草稿: ${stats.draft}</p>
        `;
        document.querySelector('.stat-card:nth-child(1) p').innerHTML = statsHtml;
    })
    .catch(error => {
        console.error('Error loading post stats:', error);
        document.querySelector('.stat-card:nth-child(1) p').innerHTML = '加载失败';
    });
    
    // 加载媒体统计
    fetch('/api/stats/media', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(stats => {
        const statsHtml = `
            <p>总媒体数: ${stats.total}</p>
            <p>总大小: ${formatFileSize(stats.totalSize)}</p>
        `;
        document.querySelector('.stat-card:nth-child(2) p').innerHTML = statsHtml;
    })
    .catch(error => {
        console.error('Error loading media stats:', error);
        document.querySelector('.stat-card:nth-child(2) p').innerHTML = '加载失败';
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}