const express = require('express');
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadCover
} = require('../controllers/articleController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getArticles)
  .post(protect, authorize('admin', 'editor'), createArticle);

router
  .route('/:id')
  .get(getArticle)
  .put(protect, authorize('admin', 'editor'), updateArticle)
  .delete(protect, authorize('admin', 'editor'), deleteArticle);

router
  .route('/:id/cover')
  .put(protect, authorize('admin', 'editor'), uploadCover);

module.exports = router;