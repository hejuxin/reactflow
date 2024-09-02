export function getHash(len) {
  let length = Number(len) || 8;
  const arr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const al = arr.length;
  let chars = '';
  while (length--) {
    chars += arr[parseInt(Math.random() * al, 10)];
  }
  return chars;
}