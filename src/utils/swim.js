let laneCount = 1;
let wrapHeight = 300;
let wrapWidth = 500;
let laneHeight = 200;
let titleWidth = 50;
const laneMinHeight = laneHeight / 2;
const laneMinWidth = 300;

function laneCountIncrease() {
  laneCount++
}

export {
  laneCount,
  laneHeight,
  titleWidth,
  wrapWidth,
  wrapHeight,
  laneMinHeight,
  laneMinWidth,
  laneCountIncrease
}