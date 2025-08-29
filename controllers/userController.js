const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    获取所有用户
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        let query;

        // 复制req.query
        const reqQuery = { ...req.query };

        // 排除的字段
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // 从query中删除这些字段
        removeFields.forEach(param => delete reqQuery[param]);

        // 创建查询字符串
        let queryStr = JSON.stringify(reqQuery);

        // 创建操作符 ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // 查找用户
        query = User.find(JSON.parse(queryStr));

        // 选择字段
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // 排序
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 分页
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await User.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // 执行查询
        const users = await query;

        // 分页结果
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: users.length,
            pagination,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    获取单个用户
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    创建用户
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    更新用户
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }

        user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    删除用户
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }

        // 确保不能删除自己
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: '不能删除当前登录用户'
            });
        }

        await user.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// @desc    上传用户头像
// @route   PUT /api/users/:id/avatar
// @access  Private/Admin
exports.uploadAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '未找到用户'
            });
        }

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
        file.name = `avatar_${user._id}${path.parse(file.name).ext}`;

        // 移动文件
        file.mv(`${process.env.FILE_UPLOAD_PATH}/avatars/${file.name}`, async err => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: '文件上传失败'
                });
            }

            // 更新数据库
            await User.findByIdAndUpdate(req.params.id, { avatar: file.name });

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