/* This was taken from http://jsben.ch/13YKQ */

export default function deepClone (o) {
  if (typeof o !== 'object') return o;

  if (!o) return o;

  if (Object.prototype.toString.apply(o) === '[object Array]') {
    const newArray = [];
    const oLen = o.length;
    let i;
    for (i = 0; i < oLen; i++) {
      newArray.push(deepClone(o[i]))
    }
    return newArray;
  }

  const newObject = {};
  let i;
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newObject[i] = deepClone(o[i]);
    }
  }
  return newObject;
}