const userDefaults = {
  id: 1,
  name: 'name',
};

export function mockUser(data = {}) {
  return {
    ...userDefaults,
    ...data,
  };
}
