console.log('--')
console.log(`Hi there, I am a deamon from hell, cursed to count sheeps until the world end.`)
console.log('--');

let count = 0;
const timer = setInterval(
  () => {
    if (count === 0)
      console.log(`${++count} sheep`)
    else
      console.log(`${++count} sheeps`)
  },
  2000
);
