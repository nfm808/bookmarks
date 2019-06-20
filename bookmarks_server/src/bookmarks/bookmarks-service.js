const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks')
  },
  getBookmarkById(knex, id) {
    return knex('bookmarks')
      .select('*')
      .where('id', id)
      .first()
  },
  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteBookmarkById(knex, id) {
    return knex
      .from('bookmarks')
      .where({ id })
      .delete()
  }
}

module.exports = BookmarksService