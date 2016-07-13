import dift, {CREATE, MOVE, REMOVE} from 'dift';
import {splice} from 'immutable-array-methods';
import {set, without} from 'immutable-object-methods';
import createKey from './create-key';

const isObj = obj => typeof obj === 'object' && obj !== null;

const arrayOneDiff = (from, to) => {
  let startIndex = 0;
  const maxIndex = to.length - 1;
  let endIndex = maxIndex;
  while (createKey(from[startIndex]) === createKey(to[startIndex]) && startIndex <= maxIndex) {
    startIndex++;
  }

  while (createKey(from[endIndex]) === createKey(to[endIndex]) && endIndex >= 0) {
    endIndex--;
  }

  return endIndex === startIndex ? endIndex : -1;
};

const arrayDiff = (from, to) => {
  if (from.length === to.length) {
    const diffIndex = arrayOneDiff(from, to);
    if (diffIndex !== -1) {
      return set(from, diffIndex, diff(from[diffIndex], to[diffIndex]));
    }
  }

  let result = from;
  dift(from, to, (type, prev, next, pos) => {
    if (type === CREATE) {
      result = splice(result, pos, 0, next);
    } else if (type === MOVE) {
      let oldPos = result.indexOf(prev);

      result = splice(result, pos, 0, prev);
      result = splice(result, oldPos < pos ? oldPos : oldPos + 1, 1);
    } else if (type === REMOVE) {
      pos = result.indexOf(prev);
      result = splice(result, pos, 1);
    }
  }, createKey);
  return result;
};

const objectDiff = (from, to) => {
  let result = from;
  const toKeys = Object.keys(to);

  toKeys.forEach(key => {
    if (!isObj(to[key])) {
      result = set(result, key, to[key]);
    } else {
      if (!isObj(result[key])) {
        result = set(result, key, {});
      }
      result = set(result, key, diff(result[key], to[key]));
    }
  });

  Object.keys(from).forEach(key => {
    if (toKeys.indexOf(key) === -1) {
      result = without(result, key);
    }
  });

  return result;
};

const diff = (from, to) => {
  if (Array.isArray(to)) {
    return Array.isArray(from) ? arrayDiff(from, to) : to;
  }

  return objectDiff(from, to);
};

module.exports = diff;
