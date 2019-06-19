function makeBookmarksArray() {
  return [
    {
      id: 1,
      name: 'google',
      url: 'http://www.google.com',
      rating: 4
    },
    {
      id: 2,
      name: 'thinkful',
      url: 'http://www.thinkful.com',
      rating: 5
    },
    {
      id: 3,
      name: '/.',
      url: 'http://slashdot.org',
      rating: 2
    },
    {
      id: 4,
      name: 'reddit',
      url: 'http://www.reddit.com',
      rating: 1
    }
  ]
}

module.exports = {
  makeBookmarksArray,
}