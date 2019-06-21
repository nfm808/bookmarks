const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const BookmarksService = require('.//bookmarks-service')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  description: !bookmark.description ? null : xss(bookmark.description),
  url: xss(bookmark.url),
  rating: bookmark.rating
})

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
      BookmarksService.getAllBookmarks(knexInstance)
        .then(bookmarks => {
          res.json(bookmarks.map(bookmark => serializeBookmark(bookmark)))
        })
        .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { title, url, rating, description } = req.body
    let newBookmark = { title, url, description, rating }
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
        logger.info(`bookmark created with id '${bookmark.id}'`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
  })

bookmarksRouter
  .route('/:bookmark_id')
  .get((req, res, next) => {
    const { bookmark_id } = req.params
    const knexInstance = req.app.get('db')
    BookmarksService.getBookmarkById(knexInstance, bookmark_id)
      .then(bookmark => {
        if(!bookmark) {
          logger.error(`Invalid bookmark GET request with id ${bookmark_id}`)
          return res
            .status(404).json({
              error: { message: `Bookmark doesn't exist`}
            })
        }
        res.json(serializeBookmark(bookmark))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    const {bookmark_id} = req.params
    const knexInstance = req.app.get('db')
    BookmarksService.getBookmarkById(knexInstance, bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Invalid bookmark DELETE request with id '${bookmark_id}'`)
          return res
            .status(404).json({
              error: { message: `Bookmark doesn't exist`}
            })
        }
        BookmarksService.deleteBookmarkById(knexInstance, bookmark.id)
        .then(() => {
          res.status(204).end()
        })
        .catch(next)
      })
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { bookmark_id } = req.params
    const { title, url, rating, description } = req.body
    const bookmarkToUpdate = { title, url, rating, description }

    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
    BookmarksService.getBookmarkById(knexInstance, bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist`}
          })
        }
        if( numberOfValues === 0) {
          return res.status(400).json({
            error: { message: `Request body content must be either 'title', 'url', 'rating', or 'description'`}
          })
        }
        BookmarksService.updateBookmark(
          knexInstance,
          bookmark_id,
          bookmarkToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
  })

module.exports = bookmarksRouter
