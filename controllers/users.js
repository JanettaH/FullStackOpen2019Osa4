const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');
const validationService = require('../utils/validationService');

usersRouter.get('/', (request, response, next) => {
  User.find({})
    .populate('blogs')
    .then(users => {
      response.json(users.map(user => user.toJSON()));
    })
    .catch(error => next(error));
});

usersRouter.delete('/:id', async (request, response, next) => {
  try {
    await User.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (exception) {
    next(exception);
  }
});

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body;

    if (!validationService.validateUser(body.username, body.password)) {
      return response
        .status(400)
        .send({ message: 'Username or password is too short. Try again!' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    });

    const savedUser = await user.save();

    response.json(savedUser);
  } catch (exception) {
    next(exception);
  }
});

module.exports = usersRouter;
