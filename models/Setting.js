const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: '江南旅游博客'
    },
    siteDescription: {
        type: String,
        default: '探索江南水乡的美丽风景和独特文化'
    },
    contactEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            '请提供有效的邮箱'
        ],
        default: 'contact@jiangnan.com'
    },
    footerText: {
        type: String,
        default: '© 2023 江南旅游博客 版权所有'
    },
    logo: {
        type: String,
        default: '/uploads/logo/default-logo.png'
    },
    favicon: {
        type: String,
        default: '/uploads/logo/favicon.ico'
    },
    articlesPerPage: {
        type: Number,
        default: 10
    },
    enableComments: {
        type: Boolean,
        default: true
    },
    enableRegistration: {
        type: Boolean,
        default: true
    },
    socialMedia: {
        wechat: {
            type: String,
            default: ''
        },
        weibo: {
            type: String,
            default: ''
        },
        douyin: {
            type: String,
            default: ''
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间
SettingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

SettingSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Setting', SettingSchema);