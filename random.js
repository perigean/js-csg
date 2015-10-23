var seed = 7;
var modulus = 0x80000000;   // ANSI C values
var multiplier = 0x41C64E6D;
var increment = 0x3039;

function randomNext() {
  var rand = seed;
  seed = ((seed * multiplier) + increment) % modulus;
  return rand;
}

function randomSetSeed(newSeed) {
  seed = newSeed;
}

// returns a random number from [min max)
function randomUniform(min, max) {
  var rand = randomNext();
  return ((rand / modulus) * (max - min)) + min;
}
