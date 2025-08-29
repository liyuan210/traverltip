const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc    获取仪表盘统计数据
// @route   GET /api/stats/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // 获取文章总数
        const articleCount = await Article.countDocuments();
        
        // 获取用户总数
        const userCount = await User.countDocuments();
        
        // 获取评论总数
        let commentCount = 0;
        try {
            commentCount = await Comment.countDocuments();
        } catch (err) {
            // Comment模型可能不存在，忽略错误
        }
        
        // 获取总浏览量
        const viewsResult = await Article.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$viewCount' }
                }
            }
        ]);
        
        const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
        
        // 获取最近发布的文章
        const recentArticles = await Article.find()
            .sort('-createdAt')
            .limit(5)
            .populate({
                path: 'author',
                select: 'name avatar'
            });
        
        res.status(200).json({
            success: true,
            data: {
                articleCount,
                userCount,
                commentCount,
                totalViews,
                recentArticles
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};