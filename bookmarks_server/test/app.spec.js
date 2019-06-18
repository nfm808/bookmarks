const app = require('../src/app')
const { API_TOKEN } = process.env


describe('App', () => {
  it('returns unauthorized without Auth headers', () => {
    return supertest(app)
      .get('/')
      .expect(401, {"error":"Unauthorized request"})
  });

  it('GET /bookmarks responds with 200 containing an array of objects', () => {
    return supertest(app)
      .get('/bookmarks')
      .set({"Authorization": 'Bearer ' + API_TOKEN} )
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.be.an('array')
        expect(res.body).to.have.lengthOf.at.least(1)
        expect(res.body[0]).to.deep.include({id: 1, name: 'google', url: 'http://www.google.com', rating: 3})
      })
  })

  it('GET /bookmarks/:id responds with 200 returning an object with valid keys', () => {
    return supertest(app)
      .get('/bookmarks')
      .set({"Authorization": 'Bearer ' + API_TOKEN} )
      .query({id: 1})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.be.an('array')
        expect(res.body[0]).to.have.all.keys('id', 'name', 'url','rating')
      })
  })


})