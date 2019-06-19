const app = require('../src/app')

describe('App', () => {
  it('returns unauthorized without Auth headers', () => {
    return supertest(app)
      .get('/')
      .expect(401, {"error":"Unauthorized request"})
  });
})