import { Position } from "@xyflow/react";
import { createSwimLaneNode, ParticipantLane, ParticipantVertical, ParticipantHorizontal, titleWidth, createLane, createWrap } from "@/nodes/Swim/utils";

export const getElements = (dataSource) => {
  const data = JSON.parse(dataSource);
  const definitions = data.elements;
  const elements = definitions[0].elements;

  let nodes = [];

  let edges = [];

  const map = new Map();

  const formatToNode = (elements, parentId) => {
    elements.forEach(element => {
      if (element.type === 'element') {
        // todo 先过滤掉flowNodeRef的
        if (element.name === 'flowNodeRef') return;

        const props = element.attributes || {};
        const children = element.elements || [];

        if (props.processRef) {
          const key = props.processRef;
          const value = props.id;
          map.set(key, value);
        }

        if (element.name === 'collaboration') {
          formatToNode(children, props.id);
          return;
        }

        if (element.name === 'participant') {
          const participantnode = createWrap({ id: props.id, position: {x: 0, y: 0} });

          participantnode.title = props.name;
          nodes.push(participantnode);

          return;
        }

        if (element.name === 'process') {
          const nodeId = map.get(props.id);
          formatToNode(children, nodeId);
          return;
          
        }

        if (element.name === 'laneSet') {
          formatToNode(children, parentId);
          return;
        }

        if (element.name === 'lane') {
          const node = createLane({ parentId, parentWidth: 0 });
          node._id = props.id;
          nodes.push(node);
          return;
        }


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

          if (props.hasOwnProperty('isHorizontal')) {
            const index = nodes.findIndex(node => node.id === nodeId || node._id === nodeId);
            const node = nodes[index];
            // 如果是子泳道直接返回
            if (node.type !== ParticipantLane) {
              node.type = props.isHorizontal ? ParticipantHorizontal : ParticipantVertical;

              nodes[index] = node;
            }
          }
          // const index = nodes.findIndex(node => node.id === nodeId);

          if (children.length) {
            formatToNode(children, nodeId);
          }

          return;
        }

        if (element.name === 'omgdc:Bounds') {
          const index = nodes.findIndex(node => node.id === parentId || node._id === parentId);
          const node = nodes[index];

          const style = {
            width: props.width,
            height: props.height
          }

          const position = {
            x: props.x,
            y: props.y
          }

          if (node.parentId) {
            const parentNode = nodes.find(n => n.id === node.id);
            position.x -= parentNode.position.x;
            position.y -= parentNode.position.y;
          }

          
          node.style = {
            ...node.style,
            ...style
          };
          node.position = {
            ...node.position,
            ...position
          };

          nodes[index] = node;

          const laneNode = nodes.filter(node => node.id.startsWith(parentId) && node.type === ParticipantLane);

          laneNode.forEach(lane => {
            if (node.type === ParticipantHorizontal) {
              lane.style.width = node.style.width - titleWidth;
            } else {
              lane.style.height = node.style.height - titleWidth;
            }
          })

          return;
        }

        // 文本暂不处理
        if (element.name === 'bpmndi:BPMNLabel') return;


        if (element.name === 'incoming' || element.name === 'outgoing') {
          // const id = element.elements[0].text;
          // // let edge = edges.find(edge => edge.id === id);
          // const index = edges.findIndex(edge => edge.id === id);
          // let edge = {};
          // if (index !== -1) {
          //   edge = edges[index];
          // } else {
          //   edge = { id };
          // }

          // if (element.name === 'incoming') {
          //   edge.target = parentId;
          // } else {
          //   edge.soruce = parentId;
          // }

          // if (index !== -1) {
          //   edges.splice(index, 1, edge);
          // } else {
          //   edges.push(edge);
          // }

          return;
        }

        if (element.name === 'sequenceFlow') {
          let edge = {
            id: props.id,
            source: props.sourceRef,
            target: props.targetRef
          }

          edges.push(edge);

          return;
        }

        if (element.name === 'bpmndi:BPMNEdge') {
          const id = props.bpmnElement;
          const start = children[0];
          const end = children[children.length - 1];

          const index = edges.findIndex(edge => edge.id === id);
          const edge = edges[index];
          const { source: sourceId, target: targetId } = edge;
          const soruceNode = nodes.find(node => node.id === sourceId);
          const targetNode = nodes.find(node => node.id === targetId);


          const startX = Number(start.attributes.x);
          const startY = Number(start.attributes.y);

          const sourceMidX = Number(soruceNode.position.x) + (Number(soruceNode.style.width) / 2);
          const sourceMidY = Number(soruceNode.position.y) + (Number(soruceNode.style.height) / 2);

          const endX = Number(end.attributes.x);
          const endY = Number(end.attributes.y);

          const targetMidX = Number(targetNode.position.x) + (Number(targetNode.style.width) / 2);
          const targetMidY = Number(targetNode.position.y) + (Number(targetNode.style.height) / 2);

          if (startX === sourceMidX) {
            if (startY < sourceMidY) {
              edge.sourceHandle = `${sourceId}-source-${Position.Top}`
            } else {
              edge.sourceHandle = `${sourceId}-source-${Position.Bottom}`
            }
          } else if (startX < sourceMidX) {
            edge.sourceHandle = `${sourceId}-source-${Position.Left}`
          } else {
            edge.sourceHandle = `${sourceId}-source-${Position.Right}`
          }

          if (endX === targetMidX) {
            if (endY < targetMidY) {
              edge.targetHandle = `${targetId}-target-${Position.Top}`
            } else {
              edge.targetHandle = `${targetId}-target-${Position.Bottom}`
            }
          } else if (endX < targetMidX) {
            edge.targetHandle = `${targetId}-target-${Position.Left}`
          } else {
            edge.targetHandle = `${targetId}-target-${Position.Right}`
          }
          return;
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
          // node.data = {
          //   ...node.data,
          //   label: props.name
          // }
          node.title = props.name;
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
  console.log(edges, 'edges')
  return {
    nodes,
    edges
  };
}


