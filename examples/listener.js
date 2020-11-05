console.log('--')
console.log(`Hi there, I am a lazy person. Nobody trust me but I can hear deamons sometimes!`)
console.log('--');

function waitForever() {
  setTimeout(waitForever, Number.MIN_SAFE_INTEGER);
};

waitForever();
