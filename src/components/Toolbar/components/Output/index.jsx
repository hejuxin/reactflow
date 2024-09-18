import { getLaneNodes, ParticipantHorizontal, ParticipantLane, ParticipantVertical } from "@/nodes/Swim/utils";
import { getHash } from "@/utils/util";
import { useReactFlow, Position } from "@xyflow/react"
import { Button } from "antd";
import { memo } from "react";
import convert from 'xml-js';

const download = (content) => {
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

const createElement = ({
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

function createPlaceholderElement({
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

const declaration = {
  attributes: {
    version: "1.0",
    encoding: "UTF-8"
  }
};

const definitions = {
  type: "element",
  name: "definitions",
  attributes: {
    "xmlns": "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
    "xmlns:omgdc": "http://www.omg.org/spec/DD/20100524/DC",
    "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
    "targetNamespace": "http://flowable.org/bpmn"
  },
  elements: []
};

const Output = () => {
  const reactflow = useReactFlow();
  const handleOutput = () => {

    const { nodes, edges } = reactflow.toObject()
    console.log(nodes, 'nodes', edges)

    const participantNodes = nodes.filter(n => n.type === ParticipantHorizontal || n.type === ParticipantVertical);
    if (participantNodes.length) {
      const collaborationId = "Collaboration_1"
      const collaboration = createElement({
        name: "collaboration",
        id: collaborationId
      });

      const processes = [];
      const participantElements = [];
      const styleElements = [];

      participantNodes.forEach(n => {
        const id = n.id;
        const element = createElement({ name: "participant", id });
        const attributes = element.attributes;
        attributes.name = n.title;
        const processId = `Process_${getHash()}`;
        attributes.processRef = processId;
        element.attributes = attributes;
        participantElements.push(element);

        const laneNodes = getLaneNodes({ nodes, parentId: id });

        const process = createElement({ name: "process", id: processId });

        if (laneNodes.length) {
          const laneSet = createElement({ name: "laneSet", id: `LaneSet_${getHash()}` });
          const laneElements = [];
          laneNodes.forEach(l => {
            const id = l.id;
            const laneElement = createElement({ name: "lane", id });
            laneElements.push(laneElement);

            const styleElement = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
            const styleAttr = styleElement.attributes;
            styleAttr.bpmnElement = id;
            styleAttr.isHorizontal = n.type === ParticipantHorizontal;
            styleElement.attributes = styleAttr;

            const bounds = createElement({ name: "omgdc:Bounds" });
            bounds.attributes = {
              x: l.position.x + n.position.x,
              y: l.position.y + n.position.y,
              ...l.style
            }

            styleElement.elements = [bounds];
            styleElements.push(styleElement);
          })

          const normalNodes = nodes.filter(n => n.parentId === id && (n.type !== ParticipantHorizontal && n.type !== ParticipantVertical && n.type !== ParticipantLane));
          const nodeElements = [];
          normalNodes.forEach(n => {
            const intersectingNodes = reactflow.getIntersectingNodes(n);

            const intersectingLaneNodes = intersectingNodes.filter(n => n.type === ParticipantLane);
            const intersectingLaneNode = intersectingLaneNodes[0];
            const laneNode = laneElements.find(l => l.attributes.id === intersectingLaneNode.id);

            const id = n.id;
            const nodeElement = createElement({ name: n.type, id });
            const nodeAttr = nodeElement.attributes;
            nodeAttr.name = n.title;
            nodeElement.attributes = nodeAttr;
            nodeElements.push(nodeElement);

            const flowNodeRef = createPlaceholderElement({ name: "flowNodeRef", text: id });

            laneNode.elements.push(flowNodeRef);

            const styleElement = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
            const styleAttr = styleElement.attributes;
            styleAttr.bpmnElement = id;
            styleElement.attributes = styleAttr;

            const bounds = createElement({ name: "omgdc:Bounds" });

            const parentNode = nodes.find(p => p.id === n.parentId);
            bounds.attributes = {
              x: parentNode.position.x + n.position.x,
              y: parentNode.position.y + n.position.y,
              ...n.style
            }

            styleElement.elements = [bounds];
            styleElements.push(styleElement);
          })

          laneSet.elements = laneElements;
          process.elements.push(laneSet, ...nodeElements);
          // process.elements.push(nodeElements)

        }
        processes.push(process);


        const styleElement = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
        const styleAttr = styleElement.attributes;
        styleAttr.bpmnElement = id;
        styleAttr.isHorizontal = n.type === ParticipantHorizontal;
        styleElement.attributes = styleAttr;

        const bounds = createElement({ name: "omgdc:Bounds" });
        bounds.attributes = {
          ...n.position,
          width: n.width ?? n.measured.width ?? n.style.width,
          height: n.height ?? n.measured.height ?? n.style.height
        }

        styleElement.elements = [bounds];
        styleElements.push(styleElement);

      });

      collaboration.elements = participantElements;

      const BPMNDiagram = createElement({
        name: "bpmndi:BPMNDiagram",
        id: `BPMNDiagram_1`
      })

      const BPMNPlane = createElement({
        name: "bpmndi:BPMNPlane",
        id: `BPMNPlane_1`
      })

      BPMNPlane.attributes.bpmnElement = collaborationId;
      BPMNPlane.elements = styleElements;
      BPMNDiagram.elements = [BPMNPlane];

      definitions.elements = [collaboration, ...processes, BPMNDiagram];
    } else {
      const processId = `Process_1`;
      const defaultProcess = createElement({ name: "process", id: processId });
      const nodeElements = [];
      const styleElements = [];

      nodes.forEach(n => {
        const id = n.id;
        const nodeElement = createElement({ name: n.type, id });
        const nodeAttr = nodeElement.attributes;
        nodeAttr.name = n.title;
        nodeElement.attributes = nodeAttr;
        nodeElements.push(nodeElement);


        const styleElement = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
        const styleAttr = styleElement.attributes;
        styleAttr.bpmnElement = id;
        styleElement.attributes = styleAttr;

        const bounds = createElement({ name: "omgdc:Bounds" });
        bounds.attributes = {
          ...n.position,
          ...n.style
        }

        styleElement.elements = [bounds];
        styleElements.push(styleElement);
      })



      const BPMNDiagram = createElement({
        name: "bpmndi:BPMNDiagram",
        id: `BPMNDiagram_1`
      })

      const BPMNPlane = createElement({
        name: "bpmndi:BPMNPlane",
        id: `BPMNPlane_1`
      })

      BPMNPlane.attributes.bpmnElement = processId;
      BPMNPlane.elements = styleElements;

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
          const handle = edge.sourceHandle;
          const position = getPosition(handle, node);

          waypoint.attributes = position;
          BPMNEdge.elements.push(waypoint);
        }

        if (edge.target) {
          edgeNodeElement.attributes.targetRef = edge.target;
          const nodeElement = nodeElements.find(element => element.attributes.id === edge.target);
          const sourceElement = createPlaceholderElement({ name: "incoming", text: edge.id });
          nodeElement.elements.push(sourceElement);

          const node = nodes.find(n => n.id === edge.target);
          const waypoint = createElement({ name: "di:waypoint" });
          const handle = edge.targetHandle;
          const position = getPosition(handle, node);

          waypoint.attributes = position;
          BPMNEdge.elements.push(waypoint);
        }

        BPMNPlane.elements.push(BPMNEdge);

        nodeElements.push(edgeNodeElement);
      })

      defaultProcess.elements = nodeElements;
      BPMNDiagram.elements = [BPMNPlane];
      definitions.elements = [defaultProcess, BPMNDiagram];
    }

    const result = {
      declaration,
      elements: [definitions]
    }

    const content = convert.js2xml(result, { spaces: 4 });
    console.log(content)
    download(content);
  }
  return (
    <Button onClick={handleOutput}>output</Button>
  )
}

export default memo(Output)