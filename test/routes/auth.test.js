import { request } from '../request.js';

describe('Routes: Auth', () => {
  it('should obtain a JWT token', async function() {
    const res = await request
      .post('/api/v0.0.1/auth')
      .set('Accept', 'application/json')
      .send({ password: 'password' });

    assert(res.res.statusCode, 200, 'status code incorrect');
    assert(res.body.token);
  });
});
