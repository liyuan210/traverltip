const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, '请提供评论内容'],
        trim: true,
        maxlength: [500, '评论不能超过500个字符']
    },
    article: {
        type: mongoose.Schema.ObjectId,
        ref: 'Article',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'spam'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);