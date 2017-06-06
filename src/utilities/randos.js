import randomWeight from './random-weight';
import zeros from './zeros'

export default function randos(size) {
  let array = zeros(size); // Just to fill the array so that map function works
  array = array.map((element) => {
    return randomWeight();
  });
  return array;
}
