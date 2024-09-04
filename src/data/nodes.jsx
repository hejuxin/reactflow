const nodes = [
  // { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  // { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  // { id: '3', position: { x: 300, y: 100 }, data: { label: '3' } },
  {
    id: '1-1',
    type: 'input',
    data: {
      label: 'Input Node',
    },
    position: { x: 150, y: 0 },
  },
  {
    id: '1-2',
    type: 'default',
    data: {
      label: 'Default Node',
    },
    position: { x: 0, y: 100 },
  },
  {
    id: '1-3',
    type: 'output',
    data: {
      label: 'Output Node',
    },
    position: { x: 300, y: 100 },
  },
  {
    id: '2-1',
    type: 'group',
    position: {
      x: -170,
      y: 250,
    },
    style: {
      width: 380,
      height: 180,
      backgroundColor: 'rgba(208, 192, 247, 0.2)',
    },
    data: {}
  },
  {
    id: '2-2',
    data: {
      label: 'Node with Toolbar',
    },
    type: 'tools',
    position: { x: 50, y: 50 },
    style: {
      width: 80,
      height: 80,
      background: 'rgb(208, 192, 247)',
    },
    parentId: '2-1',
    // extent: 'parent',
  },
  {
    id: '2-3',
    data: {
      label: 'Node with Toolbar and Select',
    },
    type: 'selecttools',
    position: { x: 200, y: 50 },
    style: {
      width: 100,
      height: 80,
      background: 'rgb(208, 192, 247)',
    },
    parentId: '2-1',
    // extent: 'parent',
    // expandParent: true
  },
]

const nodesMap = new Map();

nodes.forEach(node => {
  nodesMap.set(node.id, node)
});

export {
  nodes,
  nodesMap
}