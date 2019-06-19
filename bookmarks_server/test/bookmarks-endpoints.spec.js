const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

const auth = {"Authorization": 'Bearer ' + process.env.API_TOKEN}

describe('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  describe('GET /bookmarks', () => {
    context('Given no bookmarks', () => {
      it('returns 200 and empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(auth)
          .expect(200, [])
      });
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(auth)
          .expect(200, testBookmarks)
      });
    })

  })
  describe('GET /bookmarks/:bookmark_id', () => {
    context('provided the bookmark does not exist in the database', () => {
      it('returns 404', () => {
        const id = 12345
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set(auth)
          .expect(404)  
      });
    })

    context('provided there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('returns 200 and bookmark object', () => {
        const id = 2
        const expectedBookmark = testBookmarks[ id - 1 ]
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set(auth)
          .expect(200, expectedBookmark)
      });
    })
  })    
  describe('POST /bookmarks', () => {
    it('creates a bookmark, responding with 201 and the new object', () => {
      const newBookmark = {
        title: 'Test new bookmark',
        url: 'http://www.testurl.com',
        description: 'Test desc...',
        rating: 3
      }
      return supertest(app)
        .post('/bookmarks')
        .set(auth)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
        })

    });
    const requiredFields = ['title', 'url']

    requiredFields.forEach(field => {
      const newBookmark = {
        title: 'Test new bookmark',
        rating: 3,
        url: 'test.com',
        desc: 'desc...'
      }

      it(`responds with 400 and an '${field}' error message`, () => {
          delete newBookmark[field]

        return supertest(app)
          .post('/bookmarks')
          .set(auth)
          .send(newBookmark)
          .expect(400, {
            error: { message: `Must include ${field}`}
          })
      })
    })
    const invalidRatings = [6, 0]

    invalidRatings.forEach(rate => {
      const newBookmark = {
        title: 'test title',
        url: 'test.com',
        rating: rate,
        description: 'test desc...'
      }
      it(`rating = ${rate} returns 400 and error message if rating is not between 1 and 5`, () => {
        
        return supertest(app)
          .post('/bookmarks')
          .set(auth)
          .send(newBookmark)
          .expect(400, {
            error: {message: 'Rating must be between 1 and 5'}
          })
      });
  
    })

  })
  
})
