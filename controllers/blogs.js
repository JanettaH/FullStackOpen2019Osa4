const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', (request, response, next) => {
  Blog.find({})
    .then(blogs => {
      response.json(blogs.map(blog => blog.toJSON()));
    })
    .catch(error => next(error));
});

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body);

  if (blog.likes == undefined) {
    blog.likes = 0;
  }
  if (blog.title == undefined || blog.url == undefined) {
    response.status(400).send({ error: 'title and url need to be defined' });
    return;
  }

  try {
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog.toJSON());
  } catch (exception) {
    next(exception);
  }
});

module.exports = blogsRouter;
