const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const _ = require('lodash');

const api = supertest(app);

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'html',
    url: 'www.fi',
    likes: 1
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'JS',
    url: 'www.com',
    likes: 1
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('id field is returned as id', async () => {
  const response = await api.get('/api/blogs');
  _.forEach(response.body, blog => {
    expect(blog.id).toBeDefined();
  });
});

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'uusi blogi',
    author: 'kirjoittaja',
    url: 'www.osoite.fi',
    likes: 8
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  const title = response.body.map(r => r.title);
  const author = response.body.map(r => r.author);
  const url = response.body.map(r => r.url);
  const likes = response.body.map(r => r.likes);

  expect(response.body.length).toBe(initialBlogs.length + 1);
  expect(title).toContain('uusi blogi');
  expect(author).toContain('kirjoittaja');
  expect(url).toContain('www.osoite.fi');
  expect(likes).toContain(8);
});

test('a valid blog can be added without likes ', async () => {
  const newBlog = {
    title: 'uusi blogi',
    author: 'kirjoittaja',
    url: 'www.osoite.fi'
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  expect(response.body.likes).toBe(0);
});

test('blog without title and url', async () => {
  const newBlog = {
    author: 'Blog writer',
    likes: 4
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);

  const response = await api.get('/api/blogs');

  expect(response.body.length).toBe(initialBlogs.length);
});

afterAll(() => {
  mongoose.connection.close();
});
