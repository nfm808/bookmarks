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

  describe('GET /api/bookmarks', () => {
    context('Given no bookmarks', () => {
      it('returns 200 and empty array', () => {
        return supertest(app)
          .get('/api/bookmarks')
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
          .get('/api/bookmarks')
          .set(auth)
          .expect(200, testBookmarks)
      });
      
    })

    context('given an xss bookmark', () => {
      let testBookmarks = makeBookmarksArray()
      const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 3
      }
      testBookmarks.push(maliciousBookmark)

      beforeEach('inject tainted array', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with sanitized bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(auth)
          .expect(200)
          .expect(res => {
            expect(res.body[4].title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body[4].url).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body[4].description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
           })
      });
    })

  })
  describe('GET /api/bookmarks/:bookmark_id', () => {
    context('Given an xss attack bookmark', () => {
      const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 3
      }

      beforeEach('insert malicious code', () => {
        return db
          .into('bookmarks')
          .insert([maliciousBookmark])
      })

      it('removes xss attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks/${maliciousBookmark.id}`)
          .set(auth)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.equal('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.url).to.equal('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.description).to.equal(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      });
    })
    
    context('provided the bookmark does not exist in the database', () => {
      it('returns 404', () => {
        const id = 12345
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
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
          .get(`/api/bookmarks/${id}`)
          .set(auth)
          .expect(200, expectedBookmark)
      });
    })
  })    
  describe('POST /api/bookmarks', () => {
    it('creates a bookmark, responding with 201 and the new object', () => {
      const newBookmark = {
        title: 'Test new bookmark',
        url: 'http://www.testurl.com',
        description: 'Test desc...',
        rating: 3
      }
      return supertest(app)
        .post('/api/bookmarks')
        .set(auth)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
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
          .post('/api/bookmarks')
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
          .post('/api/bookmarks')
          .set(auth)
          .send(newBookmark)
          .expect(400, {
            error: {message: 'Rating must be between 1 and 5'}
          })
      });
  
    })

  })
  describe('DELETE /api/bookmarks/:bookmark_id', () => {
    context('Given there are no bookmarks', () => {
      it('returns 404 and error message', () => {
        const bookmarkId = 12345
        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set(auth)
          .expect(404, {
            error: { message: `Bookmark doesn't exist`}
          })  
      });
    })
    context('Given the bookmark exists', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach(() => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
      it('responds with 204', () => {
        const idToRemove = 1
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set(auth)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/bookmarks')
              .set(auth)
              .expect(expectedBookmarks)
            )
      });
    })
    
    
  })
  describe('PATCH /api/bookmarks/:bookmark_id', () => {
    context('Given there are no bookmarks', () => {
      it('returns 404 and error object', () => {
        const bookmarkId = 12345
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set(auth)
          .expect(404, {
            error: { message: `Bookmark doesn't exist`}
          })
      })
    })
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 204 and updates the bookmark', () => {
        const idToUpdate = 2
        const updatedBookmark = {
          title: 'updated bookmark title',
          url: 'updated.com',
          description: 'updated desc....',
          rating: 5
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updatedBookmark
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set(auth)
          .send(updatedBookmark)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set(auth)
              .expect(expectedBookmark)
          )
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set(auth)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body content must be either 'title', 'url', 'rating', or 'description'`}
          })
      })

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2
        const updatedBookmark = {
          title: 'updated title'
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate -1],
          ...updatedBookmark
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set(auth)
          .send({
            ...updatedBookmark,
            fieldToIgnore: 'should not be in GET request'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set(auth)
              .expect(expectedBookmark)  
          )
      });
    })
    
    
  })
  
  
})
