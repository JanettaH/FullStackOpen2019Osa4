const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const _ = require('lodash');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const user = new User({ username: 'root', password: 'sekret' });
  await user.save();
});

test('creation fails with proper statuscode and message if username already taken', async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: 'root',
    name: 'Superuser',
    password: 'salainen'
  };

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  expect(result.body.error).toContain('`username` to be unique');

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd.length).toBe(usersAtStart.length);
});

test('creation fails if username is too short', async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: 'ro',
    name: 'Superuser',
    password: 'salainen'
  };

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  expect(result.body.message).toContain(
    'Username or password is too short. Try again!'
  );

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd.length).toBe(usersAtStart.length);
});

test('creation fails if password is too short', async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: 'root',
    name: 'Superuser',
    password: 'sa'
  };

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  expect(result.body.message).toContain(
    'Username or password is too short. Try again!'
  );

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd.length).toBe(usersAtStart.length);
});

afterAll(() => {
  mongoose.connection.close();
});
