const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const tokenService = require('../utils/token');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', (request, response, next) => {
  Blog.find({})
    .populate('user', { username: 1, name: 1 })
    .then(blogs => {
      response.json(blogs.map(blog => blog.toJSON()));
    })
    .catch(error => next(error));
});

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.put('/:id', async (request, response, next) => {
  // same as const response = request.body
  const { body } = request;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true
    });
    response.json(updatedBlog.toJSON());
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body);

  const token = tokenService.getTokenFrom(request);
  if (blog.likes == undefined) {
    blog.likes = 0;
  }
  if (blog.title == undefined || blog.url == undefined) {
    response.status(400).send({ error: 'title and url need to be defined' });
    return;
  }

  try {
    // eslint-disable-next-line no-undef
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    const user = await User.findById(decodedToken.id);
    blog.user = user._id;

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog.toJSON());
  } catch (exception) {
    next(exception);
  }
});

module.exports = blogsRouter;
