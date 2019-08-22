var _ = require('lodash');

const dummy = blogs => {
  return 1;
};

const totalLikes = blogs => {
  const reducer = (accumulator, blog) => accumulator + blog.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = blogs => {
  let favorite;
  let max = 0;
  for (let i = 0; i < blogs.length; i++) {
    if (blogs[i].likes > max) {
      max = blogs[i].likes;
      favorite = blogs[i];
    }
  }

  let favoriteObject = {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  };

  return favoriteObject;
};

const mostBlogs = blogs => {
  var blogArray = _.map(blogs, 'author'); //create an array of author values from the object array
  var mostCommonAuthor = _.chain(blogArray)
    .countBy()
    .toPairs()
    .max(_.last)
    .head()
    .value(); //find the most commonly occurring author value
  return mostCommonAuthor;
};

const likedAuthor = blogs => {
  let authorLikeArray = [];
  _.forEach(_.groupBy(blogs, 'author'), (value, key) => {
    authorLikeArray.push({
      author: key,
      likes: totalLikes(value)
    });
  });
  return _.orderBy(authorLikeArray, ['likes'], ['desc'])[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  likedAuthor
};
