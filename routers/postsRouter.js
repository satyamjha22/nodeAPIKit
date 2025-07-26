const express = require('express');
const postsController = require('../controllers/postsController');
const { identifier } = require('../middlewares/identification');
const postsRouter = express.Router();

postsRouter.get('/all-posts', postsController.getPosts);
postsRouter.get('/single-post', postsController.singlePost);
postsRouter.post('/create-post', identifier, postsController.createPost);

postsRouter.put('/update-post', identifier, postsController.updatePost);
postsRouter.delete('/delete-post', identifier, postsController.deletePost);

module.exports = postsRouter;