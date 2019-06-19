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

  describe.only('GET /bookmarks', () => {
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

    describe('GET /bookmarks/:bookmark_id', () => {
      context('provided there are is no bookmark', () => {
        it('returns 404', () => {
          const id = 12345
          return supertest(app)
            .get(`/bookmarks/${id}`)
            .set(auth)
            .expect(404)  
        });
      })
      
    })
    
  })
  
})
