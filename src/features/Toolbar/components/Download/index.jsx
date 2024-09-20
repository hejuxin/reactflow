import { getLaneNodes, ParticipantHorizontal, ParticipantLane, ParticipantVertical } from "@/nodes/Swim/utils";
import { getHash } from "@/utils/util";
import { useReactFlow } from "@xyflow/react"
import { memo } from "react";
import convert from "xml-js";
import { createBPMNShapeAndBounds, createElement, createNodeElement, createPlaceholderElement, download, getEdgeElement, setAttr } from "./utils";
import img from "@/assets/toolbar/download.svg";
import { graphDataMap, graphId } from "@/store";

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

const BPMNDiagram = createElement({
  name: "bpmndi:BPMNDiagram",
  id: `BPMNDiagram_1`
})

const BPMNPlane = createElement({
  name: "bpmndi:BPMNPlane",
  id: `BPMNPlane_1`
})

const Download = () => {
  const reactflow = useReactFlow();

  function add({ nodes, edges, process, parentNode = {} }) {
    const styleElements = [];
    const nodeElementMap = new Map([]);

    nodes.forEach(n => {
      const id = n.id;
      const nodeElement = createNodeElement(n);

      if (n.type === "subProcess") {
        const subProcessNodeId = id;
        const data = graphDataMap.get(subProcessNodeId);
        add({ nodes: data.nodes, edges: data.edges, process: nodeElement });
      }
      nodeElementMap.set(id, nodeElement);

      const BPMNShapeElement = createBPMNShapeAndBounds({
        node: n,
      });
      styleElements.push(BPMNShapeElement);
    })

    BPMNPlane.elements.push(...styleElements);

    const BPMNEdges = getEdgeElement({
      edges,
      nodes,
      parentId: parentNode.id,
      map: nodeElementMap
    })

    BPMNPlane.elements.push(...BPMNEdges);
    const elements = new Array(...nodeElementMap.values());
    process.elements = elements;
  }

  const getResult = () => {
    const { nodes, edges } = reactflow.toObject();
    // console.log(nodes, "nodes")

    // const subProcessNodes = nodes.filter(n => n.type === "subProcess");
    // console.log(subProcessNodes, "subProcessNodes");

    // if (subProcessNodes.length) {
    //   const { nodes = [], edges = [] } = graphDataMap.get(subProcessNodes[0].id);
    //   console.log(nodes, edges, "subProcess")
    // }

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
        const processId = `Process_${getHash()}`;
        const nodeElement = createNodeElement(n, "participant", { processRef: processId });
        participantElements.push(nodeElement);

        const laneNodes = getLaneNodes({ nodes, parentId: id });

        const process = createElement({ name: "process", id: processId });


        const nodeElementMap = new Map([]);
        const laneSet = createElement({ name: "laneSet", id: `LaneSet_${getHash()}` });
        if (laneNodes.length) {
          const laneElementMap = new Map([]);
          laneNodes.forEach(l => {
            const id = l.id;
            const laneElement = createElement({ name: "lane", id });
            laneElementMap.set(id, laneElement);

            const BPMNShapeElement = createBPMNShapeAndBounds({
              node: l,
              attr: { isHorizontal: n.type === ParticipantHorizontal },
              parentNode: n
            });

            styleElements.push(BPMNShapeElement);
          })

          const normalNodes = nodes.filter(n => n.parentId === id && (n.type !== ParticipantHorizontal && n.type !== ParticipantVertical && n.type !== ParticipantLane));
          normalNodes.forEach(n => {
            const intersectingNodes = reactflow.getIntersectingNodes(n);

            const intersectingLaneNodes = intersectingNodes.filter(n => n.type === ParticipantLane);
            const intersectingLaneNode = intersectingLaneNodes[0];
            const laneNode = laneElementMap.get(intersectingLaneNode.id);

            const id = n.id;
            const nodeElement = createNodeElement(n);
            nodeElementMap.set(id, nodeElement);

            const flowNodeRef = createPlaceholderElement({ name: "flowNodeRef", text: id });

            laneNode.elements.push(flowNodeRef);

            const parentNode = nodes.find(p => p.id === n.parentId);
            const BPMNShapeElement = createBPMNShapeAndBounds({ node: n, parentNode })
            styleElements.push(BPMNShapeElement);
          })

          const laneElements = new Array(...laneElementMap.values());
          laneSet.elements = laneElements;

          // process.elements.push(nodeElements)

          const BPMNEdges = getEdgeElement({
            edges,
            nodes,
            parentId: n.id,
            map: nodeElementMap
          })

          BPMNPlane.elements.push(...BPMNEdges);

          process.elements.push(laneSet, ...new Array(...nodeElementMap.values()))
        } else {
          const normalNodes = nodes.filter(n => n.parentId === id && (n.type !== ParticipantHorizontal && n.type !== ParticipantVertical && n.type !== ParticipantLane));

          add({
            nodes: normalNodes,
            edges,
            process,
            parentNode: n
          });
        }


        processes.push(process);
        const BPMNShapeElement = createBPMNShapeAndBounds({
          node: n,
          attr: { isHorizontal: n.type === ParticipantHorizontal }
        });
        styleElements.push(BPMNShapeElement);
      });

      collaboration.elements = participantElements;

      setAttr({ o: BPMNPlane, attrs: { bpmnElement: collaborationId } });
      BPMNPlane.elements.push(...styleElements);

      definitions.elements = [collaboration, ...processes];
    } else {
      const processId = `Process_1`;
      const process = createElement({ name: "process", id: processId });

      setAttr({ o: BPMNPlane, attrs: { bpmnElement: processId } });
      add({ nodes, edges, process: process, parentId: processId });
      definitions.elements = [process];
    }

    BPMNDiagram.elements = [BPMNPlane];
    definitions.elements.push(BPMNDiagram)
    const result = {
      declaration,
      elements: [definitions]
    }

    return result;
  }

  const handleDownload = () => {
    const result = getResult();

    const content = convert.js2xml(result, { spaces: 2 });
    console.log(content, "content")
    download(content);
  }
  return (
    <div onClick={handleDownload}>
      <img src={img} alt="" title="下载BPMN文件" />
    </div>
  )
}

export default memo(Download)