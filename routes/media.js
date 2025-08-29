// 媒体管理路由
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 媒体数据文件
const MEDIA_FILE = path.join(__dirname, '../data/media.json');

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// 确保目录存在
[UPLOAD_DIR, THUMBNAIL_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 初始化媒体数据
if (!fs.existsSync(MEDIA_FILE)) {
    fs.writeFileSync(MEDIA_FILE, JSON.stringify([], null, 2));
    console.log('Created empty media file');
}

// 配置multer存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 获取所有媒体
router.get('/', authenticateToken, (req, res) => {
    fs.readFile(MEDIA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误' });
        }
        
        let mediaFiles = JSON.parse(data);
        
        // 按类型过滤
        if (req.query.type) {
            mediaFiles = mediaFiles.filter(media => media.type.startsWith(req.query.type));
        }
        
        // 排序（默认按上传日期降序）
        mediaFiles.sort((a, b) => {
            const dateA = new Date(a.uploadedAt);
            const dateB = new Date(b.uploadedAt);
            return dateB - dateA;
        });
        
        res.json(mediaFiles);
    });
});

// 获取单个媒体
router.get('/:id', authenticateToken, (req, res) => {
    fs.readFile(MEDIA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误' });
        }
        
        const mediaFiles = JSON.parse(data);
        const media = mediaFiles.find(m => m.id === req.params.id);
        
        if (!media) {
            return res.status(404).json({ message: '媒体文件不存在' });
        }
        
        res.json(media);
    });
});

// 上传媒体
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有上传文件' });
        }
        
        const file = req.file;
        
        // 创建媒体记录
        const media = {
            id: uuidv4(),
            filename: file.filename,
            originalFilename: file.originalname,
            path: `/uploads/${file.filename}`,
            url: `/uploads/${file.filename}`,
            thumbnailUrl: `/uploads/${file.filename}`, // 简化版，实际应生成缩略图
            type: file.mimetype,
            size: file.size,
            alt: req.body.alt || '',
            title: req.body.title || file.originalname,
            uploadedBy: req.user.id,
            uploadedAt: new Date().toISOString()
        };
        
        // 保存到媒体数据文件
        fs.readFile(MEDIA_FILE, (err, data) => {
            if (err) {
                return res.status(500).json({ message: '读取媒体数据失败' });
            }
            
            const mediaFiles = JSON.parse(data);
            mediaFiles.push(media);
            
            fs.writeFile(MEDIA_FILE, JSON.stringify(mediaFiles, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: '保存媒体数据失败' });
                }
                
                res.status(201).json({
                    message: '文件上传成功',
                    media: media
                });
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: '文件上传处理失败' });
    }
});

// 更新媒体信息
router.put('/:id', authenticateToken, (req, res) => {
    const { alt, title } = req.body;
    
    fs.readFile(MEDIA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误' });
        }
        
        const mediaFiles = JSON.parse(data);
        const mediaIndex = mediaFiles.findIndex(m => m.id === req.params.id);
        
        if (mediaIndex === -1) {
            return res.status(404).json({ message: '媒体文件不存在' });
        }
        
        const media = mediaFiles[mediaIndex];
        
        // 检查权限（只有上传者或管理员可以编辑）
        if (media.uploadedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '没有权限编辑此媒体文件' });
        }
        
        // 更新媒体信息
        media.alt = alt || media.alt;
        media.title = title || media.title;
        
        mediaFiles[mediaIndex] = media;
        
        fs.writeFile(MEDIA_FILE, JSON.stringify(mediaFiles, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: '保存媒体数据失败' });
            }
            
            res.json({
                message: '媒体信息更新成功',
                media: media
            });
        });
    });
});

// 删除媒体
router.delete('/:id', authenticateToken, (req, res) => {
    fs.readFile(MEDIA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误' });
        }
        
        const mediaFiles = JSON.parse(data);
        const mediaIndex = mediaFiles.findIndex(m => m.id === req.params.id);
        
        if (mediaIndex === -1) {
            return res.status(404).json({ message: '媒体文件不存在' });
        }
        
        const media = mediaFiles[mediaIndex];
        
        // 检查权限（只有上传者或管理员可以删除）
        if (media.uploadedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: '没有权限删除此媒体文件' });
        }
        
        // 删除文件
        const filePath = path.join(__dirname, '..', media.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // 删除缩略图（如果存在）
        if (media.thumbnailUrl && media.thumbnailUrl !== media.url) {
            const thumbnailPath = path.join(__dirname, '..', media.thumbnailUrl);
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }
        
        // 删除媒体记录
        mediaFiles.splice(mediaIndex, 1);
        
        fs.writeFile(MEDIA_FILE, JSON.stringify(mediaFiles, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: '保存媒体数据失败' });
            }
            
            res.json({
                message: '媒体文件删除成功'
            });
        });
    });
});

module.exports = router;