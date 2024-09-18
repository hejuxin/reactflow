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
  // aTag.click();
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

    const { nodes } = reactflow.toObject()
    console.log(nodes, 'nodes')
    const processId = `Process_1`;
    const defaultProcess = createElement({ name: "process", id: processId });

    const nodeElements = nodes.map(n => {
      const nodeElement = createElement({ name: n.type, id: n.id });
      const nodeAttr = nodeElement.attributes;
      nodeAttr.name = n.title;
      nodeElement.attributes = nodeAttr;

      return nodeElement;
    })

    defaultProcess.elements = nodeElements;

    definitions.elements = [defaultProcess];


    const result = {
      declaration,
      elements: [definitions]
    }

    const content = convert.js2xml(result);
    console.log(content);
    
    download(content);
  }
  return (
    <Button onClick={handleOutput}>output</Button>
  )
}

export default memo(Output)