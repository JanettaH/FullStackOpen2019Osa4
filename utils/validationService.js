exports.validateUser = (username, password) => {
  if (username == null || username.length < 3) {
    return false;
  } else if (password == null || password.length < 3) {
    return false;
  } else {
    return true;
  }
};
