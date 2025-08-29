const Setting = require('../models/Setting');
const path = require('path');
const fs = require('fs');

// @desc    获取系统设置
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
    try {
        // 获取设置，如果不存在则创建默认设置
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create({
                siteName: '江南旅游博客',
                siteDescription: '探索江南水乡的美丽风景和独特文化',
                contactEmail: 'contact@jiangnan.com',
                footerText: '© 2023 江南旅游博客 版权所有',
                logo: '/uploads/logo/default-logo.png',
                favicon: '/uploads/logo/favicon.ico',
                articlesPerPage: 10,
                enableComments: true,
                enableRegistration: true,
                socialMedia: {
                    wechat: '',
                    weibo: '',
                    douyin: ''
                }
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    更新系统设置
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    try {
        // 获取设置，如果不存在则创建
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findOneAndUpdate({}, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    上传网站Logo
// @route   PUT /api/settings/logo
// @access  Private/Admin
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: '请上传文件'
            });
        }

        const file = req.files.file;

        // 确保文件是图片
        if (!file.mimetype.startsWith('image')) {
            return res.status(400).json({
                success: false,
                message: '请上传图片文件'
            });
        }

        // 检查文件大小
        if (file.size > process.env.MAX_FILE_UPLOAD) {
            return res.status(400).json({
                success: false,
                message: `请上传小于${process.env.MAX_FILE_UPLOAD}的图片`
            });
        }

        // 创建自定义文件名
        file.name = `logo${path.parse(file.name).ext}`;

        // 移动文件
        file.mv(`${process.env.FILE_UPLOAD_PATH}/logo/${file.name}`, async err => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: '文件上传失败'
                });
            }

            // 更新数据库
            await Setting.findOneAndUpdate({}, { logo: `/uploads/logo/${file.name}` });

            res.status(200).json({
                success: true,
                data: file.name
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    上传网站图标
// @route   PUT /api/settings/favicon
// @access  Private/Admin
exports.uploadFavicon = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: '请上传文件'
            });
        }

        const file = req.files.file;

        // 确保文件是图片
        if (!file.mimetype.startsWith('image')) {
            return res.status(400).json({
                success: false,
                message: '请上传图片文件'
            });
        }

        // 检查文件大小
        if (file.size > process.env.MAX_FILE_UPLOAD) {
            return res.status(400).json({
                success: false,
                message: `请上传小于${process.env.MAX_FILE_UPLOAD}的图片`
            });
        }

        // 创建自定义文件名
        file.name = `favicon.ico`;

        // 移动文件
        file.mv(`${process.env.FILE_UPLOAD_PATH}/logo/${file.name}`, async err => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: '文件上传失败'
                });
            }

            // 更新数据库
            await Setting.findOneAndUpdate({}, { favicon: `/uploads/logo/${file.name}` });

            res.status(200).json({
                success: true,
                data: file.name
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};