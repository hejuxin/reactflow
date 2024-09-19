import { Position } from "@xyflow/react";
import { getHash } from "@/utils/util";

export const download = (content) => {
  const fileName = "diagram.bpmn";
  const file = new File([content], fileName, {
    type: "text/plain",
  });

  var aTag = document.createElement('a');
  aTag.download = fileName;
  aTag.href = URL.createObjectURL(file);
  aTag.click();
}

function getPosition(handle, node) {
  let x = node.position.x;
  let y = node.position.y;
  const width = node.style.width;
  const height = node.style.height;
  if (handle.indexOf(Position.Top) > -1 || handle.indexOf(Position.Bottom) > -1) {
    x = node.position.x + (width / 2);
    if (handle.indexOf(Position.Top) > -1) {
      y = node.position.y;
    } else {
      y = node.position.y + height;
    }
  } else {
    y = node.position.y + (height / 2);
    if (handle.indexOf(Position.Left) > -1) {
      x = node.position.x;
    } else {
      x = node.position.x + width;
    }
  }

  const position = { x, y };
  return position
}

export const createElement = ({
  type = "element",
  name,
  id = getHash()
}) => {
  return {
    type,
    name,
    attributes: {
      id
    },
    elements: []
  }
}

export function createPlaceholderElement({
  type = "element",
  name,
  text
}) {
  return {
    type,
    name,
    elements: [
      {
        type: "text",
        text
      }
    ]
  }
}

export function getEdgeElement({
  edges,
  nodeElements,
  nodes,
  parentId,
  BPMNPlane
}) {
  edges.forEach(edge => {
    const edgeNodeElement = createElement({ name: "sequenceFlow", id: edge.id });

    const BPMNEdge = createElement({ name: "bpmndi:BPMNEdge", id: `${edge.id}_di` });
    BPMNEdge.attributes.bpmnElement = edge.id;

    if (edge.source) {
      edgeNodeElement.attributes.sourceRef = edge.source;
      const nodeElement = nodeElements.find(element => element.attributes.id === edge.source);
      const sourceElement = createPlaceholderElement({ name: "outgoing", text: edge.id });
      nodeElement.elements.push(sourceElement);

      const node = nodes.find(n => n.id === edge.source);
      const waypoint = createElement({ name: "di:waypoint" });
      // 默认为右边
      let position = {
        x: node.position.x + node.style.width,
        y: node.position.y + (node.style.height) / 2
      }
      const handle = edge.sourceHandle;
      if (handle) {
        position = getPosition(handle, node);
      }
      if (parentId) {
        const parentNode = nodes.find(p => p.id === parentId);
        waypoint.attributes = {
          x: position.x + parentNode.position.x,
          y: position.y + parentNode.position.y,
        };
      } else {
        waypoint.attributes = position;
      }

      BPMNEdge.elements.push(waypoint);
    }

    if (edge.target) {
      edgeNodeElement.attributes.targetRef = edge.target;
      const nodeElement = nodeElements.find(element => element.attributes.id === edge.target);
      const sourceElement = createPlaceholderElement({ name: "incoming", text: edge.id });
      nodeElement.elements.push(sourceElement);

      const node = nodes.find(n => n.id === edge.target);
      const waypoint = createElement({ name: "di:waypoint" });

      // 默认为左边
      let position = {
        x: node.position.x,
        y: node.position.y + (node.style.height) / 2
      }
      const handle = edge.targetHandle;
      if (handle) {
        position = getPosition(handle, node);
      }

      if (parentId) {
        const parentNode = nodes.find(p => p.id === parentId);
        waypoint.attributes = {
          x: position.x + parentNode.position.x,
          y: position.y + parentNode.position.y,
        };
      } else {
        waypoint.attributes = position;
      }
      BPMNEdge.elements.push(waypoint);
    }

    BPMNPlane.elements.push(BPMNEdge);

    nodeElements.push(edgeNodeElement);

    // BPMNDiagram.elements = [BPMNPlane];
  })
}