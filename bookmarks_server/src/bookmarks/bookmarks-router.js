const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const bookmarks  = require('../store')
const { PORT } = require('../config')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
      BookmarksService.getAllBookmarks(knexInstance)
        .then(bookmarks => {
          res.json(bookmarks)
        })
        .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { title, url, rating=3, description } = req.body
    const newBookmark = { title, url, description, rating }
    console.log(newBookmark.rating)
    if (!title) {
      logger.error(`title is required`)
      return res
        .status(400)
        .json({
         error: {message: 'Must include title'}
        })
    }

    if (!url) {
      logger.error(`url is required`)
      return res
        .status(400)
        .json({
          error: {message: 'Must include url'}
        })
    }

    if (newBookmark.rating < 1 || newBookmark.rating > 5) {
      logger.error(`rating must be between 1 and 5`)
      return res
        .status(400)
        .json({
          error: { message: 'Rating must be between 1 and 5'}
        })
    }

    BookmarksService.insertBookmark(
      knexInstance,
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(bookmark)
      })
      .catch(next)
  })

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    const { id } = req.params
    const knexInstance = req.app.get('db')
    BookmarksService.getBookmarkById(knexInstance, id)
      .then(bookmark => {
        if(!bookmark) {
          return res
            .status(404).json({
              error: { message: `Bookmark doesn't exist`}
            })
        }
        res.json(bookmark)
      })
      .catch(next)
  })
  .delete((req, res) => {
    const { id } = req.params

    const listIndex = bookmarks.findIndex(bm => bm.id == id)

    if ( listIndex === -1 ) {
      logger.error(`bookmark not found id: ${id}`)
      return res
        .status(404)
        .send('Not Found')
    }

    bookmarks.splice(listIndex, 1)

    logger.info(`Bookmark Id: ${id} deleted`)

    res
      .status(204)
      .end()
  })

module.exports = bookmarksRouter
