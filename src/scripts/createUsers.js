import { signUp } from '../services/user';
import { getRandomAlphanumericCode } from '../utilities/random';

const alphabetCaps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabetLower = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLocaleLowerCase();
const alphabetNumbers = '0123456789';
const alphabetSymbols = '!@#$%^&*()-';

function shuffleWord(word) {
  let shuffledWord = '';
  word = word.split('');
  while (word.length > 0) {
    shuffledWord += word.splice((word.length * Math.random()) << 0, 1);
  }
  return shuffledWord;
}

function generatePassword() {
  const chars =
    getRandomAlphanumericCode(2, alphabetCaps) +
    // getRandomAlphanumericCode(2, alphabetSymbols) +
    getRandomAlphanumericCode(2, alphabetNumbers) +
    getRandomAlphanumericCode(4, alphabetLower);

  return shuffleWord(chars);
}

const emails = [''];

async function createUsers(emailList) {
  for (let i = 0; i < emailList.length; i++) {
    const email = emailList[i];
    const password = generatePassword();
    const { user } = await signUp(email, password);

    console.log(email, password, user.id);
  }
}

createUsers(emails)
  .then(() => console.log('DONE'))
  .catch((e) => console.log(e));
