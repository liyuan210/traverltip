// 加载媒体列表
function loadMedia() {
    const token = localStorage.getItem('authToken');
    const mediaListElement = document.getElementById('mediaList');
    
    mediaListElement.innerHTML = '<p>正在加载媒体列表...</p>';
    
    fetch('/api/media', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(mediaFiles => {
        if (mediaFiles.length === 0) {
            mediaListElement.innerHTML = '<p>暂无媒体文件</p>';
            return;
        }
        
        let mediaHTML = '<div class="media-grid">';
        
        mediaFiles.forEach(media => {
            mediaHTML += `
                <div class="media-item">
                    <img src="${media.thumbnailUrl}" alt="${media.alt || media.filename}">
                    <div class="media-info">
                        <p>${media.title || media.filename}</p>
                        <small>${formatFileSize(media.size)}</small>
                    </div>
                    <div class="media-actions">
                        <button onclick="copyMediaUrl('${media.url}')" title="复制URL">📋</button>
                        <button onclick="deleteMedia('${media.id}')" class="danger" title="删除">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        mediaHTML += '</div>';
        mediaListElement.innerHTML = mediaHTML;
    })
    .catch(error => {
        console.error('Error loading media:', error);
        mediaListElement.innerHTML = '<p>加载媒体失败</p>';
    });
}

// 复制媒体URL到剪贴板
function copyMediaUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('URL已复制到剪贴板');
    }).catch(err => {
        console.error('无法复制URL: ', err);
        // 备用方法
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('URL已复制到剪贴板');
    });
}

// 删除媒体
function deleteMedia(id) {
    if (!confirm('确定要删除这个媒体文件吗？此操作不可撤销。')) {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || '媒体文件已删除');
        loadMedia();
    })
    .catch(error => {
        console.error('Error deleting media:', error);
        alert('删除媒体文件失败');
    });
}

// 处理媒体上传
function handleMediaUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const token = localStorage.getItem('authToken');
    
    // 显示上传进度
    const mediaListElement = document.getElementById('mediaList');
    mediaListElement.innerHTML = '<p>正在上传媒体文件...</p>';
    
    // 创建一个计数器来跟踪上传完成的文件数量
    let completedUploads = 0;
    let failedUploads = 0;
    
    // 为每个文件创建一个上传Promise
    const uploadPromises = Array.from(files).map(file => {
        const formData = new FormData();
        formData.append('image', file);
        
        return fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            completedUploads++;
            return data;
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            failedUploads++;
            return null;
        });
    });
    
    // 等待所有上传完成
    Promise.all(uploadPromises)
        .then(() => {
            alert(`上传完成: ${completedUploads}个成功, ${failedUploads}个失败`);
            loadMedia();
        });
}