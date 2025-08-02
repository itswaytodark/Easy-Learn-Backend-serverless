import express from 'express';
import { createBlog, deleteBlog, deleteBlogById, getBlogs, getSingleBlog, getUserBlogs, updateBlog } from '../controllers/blogController.js';
import { userAuth } from '../middelware/userAuth.js';
import multer from '../config/multer.js';

const blogRouter = express.Router();

blogRouter.post('/blog-create', userAuth, multer.single('image'), createBlog);
blogRouter.delete('/blog-delete/:id',userAuth, deleteBlog);
blogRouter.put('/blog-update/:id',userAuth, updateBlog);
blogRouter.get('/blogs', getBlogs);
blogRouter.get('/blog/:id', getSingleBlog);

blogRouter.get('/my-blogs', userAuth, getUserBlogs);
blogRouter.delete('/delete/:id', userAuth, deleteBlogById);



export default blogRouter;
