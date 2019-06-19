function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'google',
      url: 'http://www.google.com',
      rating: 4,
      description: 'search baby'
    },
    {
      id: 2,
      title: 'thinkful',
      url: 'http://www.thinkful.com',
      rating: 5,
      description: 'think about it'
    },
    {
      id: 3,
      title: '/.',
      url: 'http://slashdot.org',
      rating: 2,
      description: 'news for nerds'
    },
    {
      id: 4,
      title: 'reddit',
      url: 'http://www.reddit.com',
      rating: 1,
      description: 'a place to find community in the web'
    }
  ]
}

module.exports = {
  makeBookmarksArray,
}