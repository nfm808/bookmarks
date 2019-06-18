function makeBookmarksArray() {
  return [
    {
      id: 1,
      url: 'http://www.google.com',
      rating: 4
    },
    {
      id: 2,
      url: 'http://www.thinkful.com',
      rating: 5
    },
    {
      id: 3,
      url: 'http://slashdot.org',
      rating: 2
    },
    {
      id: 4,
      url: 'http://www.reddit.com',
      rating: 1
    }
  ]
}

module.exports = {
  makeBookmarksArray,
}