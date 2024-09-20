import { Position } from "@xyflow/react";
import { getHash } from "@/utils/util";
import { graphDataMap, maingraphId } from "@/store";
import { graphNodeInBPMNMap } from "@/nodes";

export function download(content) {
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

export function createElement({
  type = "element",
  name,
  id = getHash()
}) {
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
  nodes,
  parentId,
  map
}) {
  const BPMNEdgeMap = new Map([]);
  edges.forEach(edge => {
    const edgeNodeElementId = edge.id;
    const edgeNodeElement = createElement({ name: "sequenceFlow", id: edgeNodeElementId });

    const BPMNEdgeId = `${edgeNodeElementId}_di`
    const BPMNEdge = createElement({ name: "bpmndi:BPMNEdge", id: `${edgeNodeElementId}_di` });
    BPMNEdge.attributes.bpmnElement = edgeNodeElementId;

    if (edge.source) {
      edgeNodeElement.attributes.sourceRef = edge.source;
      const sourceElement = map.get(edge.source);
      const placeholderElement = createPlaceholderElement({ name: "outgoing", text: edgeNodeElementId });
      sourceElement.elements.push(placeholderElement);

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
      const targetElement = map.get(edge.source);
      const placeholderElement = createPlaceholderElement({ name: "outgoing", text: edgeNodeElementId });
      targetElement.elements.push(placeholderElement);

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

    BPMNEdgeMap.set(BPMNEdgeId, BPMNEdge);
    map.set(edgeNodeElementId, edgeNodeElement)

    // BPMNDiagram.elements = [BPMNPlane];
  })

  const BPMNEdges = new Array(...BPMNEdgeMap.values());
  return BPMNEdges;
}

export function setAttr({
  o,
  attrs = {}
}) {
  const attributes = o.attributes;
  Object.keys(attrs).forEach(key => {
    const value = attrs[key];
    attributes[key] = value;
  });

  o.attributes = attributes;
}

export function createBPMNShape(id, attr = {}) {
  const element = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
  setAttr({ o: element, attrs: { ...attr, bpmnElement: id } });

  return element;
}

function getSize(node, key) {
  return node[key] ?? node.measured?.[key] ?? node.style?.[key]
}


export function createBPMNShapeAndBounds({ node, attr = {}, parentNode = {} }) {
  const BPMNShape = createBPMNShape(node.id, attr);
  const bounds = createElement({ name: "omgdc:Bounds" });
  bounds.attributes = {
    x: (parentNode.position?.x ?? 0) + node.position.x,
    y: (parentNode.position?.y ?? 0) + node.position.y,
    width: getSize(node, "width"),
    height: getSize(node, "height"),
  }

  BPMNShape.elements = [bounds];

  return BPMNShape;
}

export function createNodeElement(node, attr = {}) {
  const element = createElement({ name: graphNodeInBPMNMap.get(node.type), id: node.id });
  setAttr({ o: element, attrs: { ...attr, name: node.title } });

  return element;
}


export function getParentNode(parentId) {
  const nodes = graphDataMap.get(maingraphId);
  const parentNode = nodes.find(n => n.id === parentId);

  return parentNode;
}