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
        if (props.processRef) {
          const key = props.processRef;
          const value = props.id;
          map.set(key, value);
        }

        const children = element.elements || [];
        const node = {
          id: props.id,
          type: element.name,
          
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
  
}


