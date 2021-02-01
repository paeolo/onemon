const chalk = require('chalk');
const { notifyReady } = require('../dist/');

console.log(chalk.red('Youpi!'));

console.log('--')
console.log(`Hi there, I am a deamon from hell, cursed to count sheeps until the world end.`)
console.log('--');

let count = 0;

setInterval(
  () => {
    if (count === 0)
      console.log(`${++count} sheep`);
    else
      console.log(`${++count} sheeps`);

    if (count == 1)
      notifyReady();
  },
  2000
);
