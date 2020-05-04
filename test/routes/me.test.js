import { request } from '../request.js';
import { mockUser } from '../mock/user.js';

describe('Routes: Me', async () => {
  it('should return our mock user', async function() {
    // Get token
    const jwtRes = await request
      .post('/api/v0.0.1/auth')
      .set('Accept', 'application/json')
      .send({ password: 'password' });

    const jwt = jwtRes.body.token;

    const res = await request
      .get('/api/v0.0.1/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwt}`);

    assert.deepEqual(res.body, mockUser(), 'body incorrect');
    assert.equal(res.res.statusCode, 200, 'status code incorrect');
  });
});
