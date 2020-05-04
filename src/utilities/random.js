const crypto = require('crypto');

export function getRandomAlphanumericCode(
  length,
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
) {
  const alphabetLength = alphabet.length;
  const bytes = crypto.randomBytes(length);
  const code = new Array(length);

  for (let i = 0; i < length; i++) {
    let index = Math.round((bytes[i] / 255) * (alphabetLength - 1));
    code.push(alphabet[index]);
  }

  return code.join('');
}
