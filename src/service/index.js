export const getNodes = (dataSource) => {
  const data = JSON.parse(dataSource);
  const definitions = data.elements;
  const elements = definitions[0].elements;

  let nodes = [];

  const map = new Map();

  const formatToNode = (elements, parentId) => {
    elements.forEach(element => {
      if (element.type === 'element') {
        // todo 先过滤掉flowNodeRef的
        if (element.name === 'flowNodeRef') return;

        const props = element.attributes || {};
        const children = element.elements || [];

        
        if (element.name === 'bpmndi:BPMNDiagram') {
          if (children.length) {
            formatToNode(children);
          }
          return;
        }

        if (element.name === 'bpmndi:BPMNPlane') {
          if (children.length) {
            formatToNode(children);
          }
          return;
        }

        if (element.name === 'bpmndi:BPMNShape') {
          const nodeId = props.bpmnElement;


          if (children.length) {
            formatToNode(children, nodeId);
          }

          return;
        }

        if (element.name === 'omgdc:Bounds') {
          const index = nodes.findIndex(node => node.id === parentId);
          const style = {
            width: props.width,
            height: props.height
          }

          const position = {
            x: props.x,
            y: props.y
          }

          const node = nodes[index];
          node.style = style;
          node.position = position;
          nodes.splice(index, 1, node);

          return;
        }

        // 文本暂不处理
        if (element.name === 'bpmndi:BPMNLabel') return;

        if (props.processRef) {
          const key = props.processRef;
          const value = props.id;
          map.set(key, value);
        }

        const node = {
          id: props.id,
          type: element.name,
          position: {
            x: 0,
            y: 0
          },
          data: {}
        }

        if (props.name) {
          node.data = {
            ...node.data,
            label: props.name
          }
        }

        if (parentId) {
          node.parentId = parentId
        }

        if (map.has(props.id)) {
          node.parentId = map.get(props.id);
        }
  
        nodes.push(node);

        if (children.length) {
          formatToNode(children, props.id);
        }
      }
      
    })
  }

  formatToNode(elements);
  

  console.log(nodes, 'nodes');
  return nodes;
}


