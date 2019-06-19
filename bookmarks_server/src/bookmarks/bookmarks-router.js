const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const bookmarks  = require('../store')
const { PORT } = require('../config')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

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
  .post(bodyParser, (req, res) => {
    const { name, url, rating=3 } = req.body

    if (!name) {
      logger.error(`name is required`)
      return res
        .status(400)
        .send('Must include name')
    }

    if (!url) {
      logger.error(`url is required`)
      return res
        .status(400)
        .send('Must include URI')
    }
    // continue validation here...most likely with 
    // library

    const id = uuid()
    const bookmark = {
      id,
      name,
      url,
      rating
    }

    bookmarks.push(bookmark)
    logger.info(`bookmark created with id: ${id} `)
    res
      .status(201)
      .location(`http://localhost:${PORT}/bookmarks/${id}`)
      .json(id)

  })

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    const { id } = req.params
    if ( !id ) {
      logger.error(`Invalid bookmark id: ${id}`)
      return res
        .status(404)
        .send(`Not a valid bookmark`)
    }
    const knexInstance = req.app.get('db')
    BookmarksService.getBookmarkById(knexInstance, id)
      .then(bookmark => {
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
