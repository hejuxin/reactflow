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

export function getRectBoundaries(nodes) {
  if (!nodes.length) return null;
  let startX = 0, endX = 0;
  let startY = 0, endY = 0;
  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;

    const width = Number(node.width ?? node.measured?.width ?? node.style?.width);
    const height = Number(node.height ?? node.measured?.height ?? node.style?.height);

    startX = Math.min(x, startX);
    startY = Math.min(y, startY);

    endX = Math.max((x + width), endX);
    endY = Math.max((y + height), endY);
  })


  return {
    startX,
    startY,
    endX,
    endY
  }
}

export function getNodeBoundaries(node) {
  const x = node.position.x;
  const y = node.position.y;

  const width = Number(node.width ?? node.measured?.width ?? node.style?.width);
  const height = Number(node.height ?? node.measured?.height ?? node.style?.height);

  return {
    x,
    y,
    endX: x + width,
    endY: y + height
  }
}