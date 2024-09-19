import { getLaneNodes, ParticipantHorizontal, ParticipantLane, ParticipantVertical } from "@/nodes/Swim/utils";
import { getHash } from "@/utils/util";
import { useReactFlow } from "@xyflow/react"
import { Button } from "antd";
import { memo } from "react";
import convert from "xml-js";
import { createElement, createPlaceholderElement, download, getEdgeElement } from "./utils";
import img from "@/assets/toolbar/download.svg";

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

const Download = () => {
  const reactflow = useReactFlow();

  const getResult = () => {
    const { nodes, edges } = reactflow.toObject()

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

      const BPMNDiagram = createElement({
        name: "bpmndi:BPMNDiagram",
        id: `BPMNDiagram_1`
      })

      const BPMNPlane = createElement({
        name: "bpmndi:BPMNPlane",
        id: `BPMNPlane_1`
      })

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

        const nodeElements = [];
        const laneSet = createElement({ name: "laneSet", id: `LaneSet_${getHash()}` });
        if (laneNodes.length) {
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

          // process.elements.push(nodeElements)
        } else {
          const normalNodes = nodes.filter(n => n.parentId === id && (n.type !== ParticipantHorizontal && n.type !== ParticipantVertical && n.type !== ParticipantLane));

          normalNodes.forEach(n => {
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

            const parentNode = nodes.find(p => p.id === n.parentId);
            bounds.attributes = {
              x: parentNode.position.x + n.position.x,
              y: parentNode.position.y + n.position.y,
              ...n.style
            }

            styleElement.elements = [bounds];
            styleElements.push(styleElement);
          })
        }

        getEdgeElement({
          nodes,
          nodeElements,
          edges,
          parentId: n.id,
          BPMNPlane
        })

        process.elements.push(laneSet, ...nodeElements)
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



      BPMNPlane.attributes.bpmnElement = collaborationId;
      BPMNPlane.elements.push(...styleElements);
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

      getEdgeElement({
        edges,
        nodes,
        nodeElements,
        BPMNPlane
      })

      defaultProcess.elements = nodeElements;
      BPMNDiagram.elements = [BPMNPlane];
      definitions.elements = [defaultProcess, BPMNDiagram];
    }

    const result = {
      declaration,
      elements: [definitions]
    }

    return result;
  }

  const handleDownload = () => {
    const result = getResult();

    const content = convert.js2xml(result, { spaces: 2 });
    download(content);
  }
  return (
    <div onClick={handleDownload}>
      <img src={img} alt="" title="下载BPMN文件" />
    </div>
  )
}

export default memo(Download)