const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks')
  },
}