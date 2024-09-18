import { ParticipantHorizontal, ParticipantVertical } from "@/nodes/Swim/utils";
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

        const process = createElement({ name: "process", id: processId });
        processes.push(process);


        const styleElement = createElement({ name: "bpmndi:BPMNShape", id: `${id}_di` });
        const styleAttr = styleElement.attributes;
        styleAttr.bpmnElement = id;
        styleAttr.isHorizontal = n.type === ParticipantHorizontal;
        styleElement.attributes = styleAttr;

        const bounds = createElement({ name: "omgdc:Bounds" });
        bounds.attributes = {
          ...n.position,
          ...n.style
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
          const sourceElement = createElement({ name: "outgoing" });
          sourceElement.elements = [
            {
              type: "text",
              text: edge.id
            }
          ]
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
          const sourceElement = createElement({ name: "incoming" });
          sourceElement.elements = [
            {
              type: "text",
              text: edge.id
            }
          ]
          nodeElement.elements.push(sourceElement);

          const node = nodes.find(n => n.id === edge.target);
          const waypoint = createElement({ name: "di:waypoint" });
          const handle = edge.targetHandle;
          const position = getPosition(handle, node);

          waypoint.attributes = position;
          BPMNEdge.elements.push(waypoint);
        }

        BPMNPlane.elements.push(BPMNEdge);

        edgeNodeElement.push(edgeNodeElement);
      })

      defaultProcess.elements = nodeElements;
      BPMNDiagram.elements = [BPMNPlane];
      definitions.elements = [defaultProcess, BPMNDiagram];
    }

    const result = {
      declaration,
      elements: [definitions]
    }

    const content = convert.js2xml(result);
    console.log(content)
    download(content);
  }
  return (
    <Button onClick={handleOutput}>output</Button>
  )
}

export default memo(Output)