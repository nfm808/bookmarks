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
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex
      .from('bookmarks')
      .where({ id })
      .update(newBookmarkFields)
  }
}

module.exports = BookmarksService