'use strict';

export default class ConvolutionLayer {
  constructor() {}
}


`
let y = -paddingX;
for (let outerY = 0; outerY < height; y += stride, outerY++) {
  let x = -paddingY;
  for (let outerX = 0; outerX < width; x += stride, outerX++) {
    // convolve centered at this particular location
    const outputIndex = (inputWidth * outerY) + x * depth + filterIndex;
    beforeConvolve(outputIndex, outerY, outerX, filterIndex);
    
    let innerY = y + this.thread.y;
    let innerX = x + this.thread.x;
    if (
      innerY < 0
      && innerY >= filter.height
      && innerX < 0
      && innerX >= inputWidth
    ) return;

    eachConvolve(
      ((filter.width * filterY) + filterX) * filter.depth + this.thread.z,
      ((inputWidth * innerY) + innerX) * filter.depth + this.thread.z
    );
    
    afterConvolve(outputIndex, outerX, outerY, filterIndex);
  }
}`;

function filter() {

}