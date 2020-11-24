"use strict";

function reverse(promise: Promise<unknown[]>) {
  return new Promise((resolve, reject) =>
    Promise.resolve(promise).then(reject, resolve)
  );
}

export function promiseAny(iterable: any) {
  return reverse(Promise.all([...iterable].map(reverse)));
}
