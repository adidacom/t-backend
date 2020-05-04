import { mockUser } from '../mock/user.js';
import { MeService } from '../../src/services';

describe('Services: Me', () => {
  it('should return who i am', async function() {
    const me = await MeService.whoami(mockUser());
    assert.deepEqual(me, mockUser(), 'user was not identified correctly');
  });
});
