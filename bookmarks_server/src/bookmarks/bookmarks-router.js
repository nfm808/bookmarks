const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const bookmarks  = require('../store')
const { PORT } = require('../config')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
      .status(200)
      .json(bookmarks)
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
  .get((req, res) => {
    const { id } = req.params

    const bookmark = bookmarks.filter(bm => bm.id == id )
    if ( !id || bookmark.length == 0 ) {
      logger.error(`Invalid bookmark id: ${id}`)
      return res
        .status(404)
        .send(`${id} is not a valid bookmark id`)
    }

    return res
      .status(200)
      .json(bookmark)
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
