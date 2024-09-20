import { getLaneNodes, ParticipantHorizontal, ParticipantLane, ParticipantVertical } from "@/nodes/Swim/utils";
import { getHash } from "@/utils/util";
import { useReactFlow } from "@xyflow/react"
import { memo } from "react";
import convert from "xml-js";
import { createBPMNShapeAndBounds, createElement, createNodeElement, createPlaceholderElement, download, getEdgeElement, setAttr } from "./utils";
import img from "@/assets/toolbar/download.svg";
import { graphDataMap, graphId, maingraphId } from "@/store";

const declaration = {
  attributes: {
    version: "1.0",
    encoding: "UTF-8"
  }
};

const BPMNDiagramMap = new Map([]);

const Download = () => {
  const reactflow = useReactFlow();

  function add({ nodes, edges, process, processId, parentNode = {} }) {
    const styleElements = [];
    const nodeElementMap = new Map([]);

    nodes.forEach(n => {
      const id = n.id;
      const nodeElement = createNodeElement(n);

      if (n.type === "subProcess") {
        const subProcessNodeId = id;
        const data = graphDataMap.get(subProcessNodeId) || {};
        add({ nodes: data.nodes ?? [], edges: data.edges ?? [], process: nodeElement, processId: subProcessNodeId });
      }
      nodeElementMap.set(id, nodeElement);

      const BPMNShapeElement = createBPMNShapeAndBounds({
        node: n,
      });
      styleElements.push(BPMNShapeElement);
    })

    const BPMNDiagramId = `BPMNDiagram_${getHash()}`;
    const BPMNDiagram = createElement({
      name: "bpmndi:BPMNDiagram",
      id: BPMNDiagramId
    })

    const BPMNPlane = createElement({
      name: "bpmndi:BPMNPlane",
      id: `BPMNPlane_${getHash()}`
    })

    setAttr({ o: BPMNPlane, attrs: { bpmnElement: processId } });

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

    BPMNDiagram.elements = [BPMNPlane];
    BPMNDiagramMap.set(BPMNDiagramId, BPMNDiagram);
  }

  function getData() {
    let nodes = [];
    let edges = [];
    if (graphId === maingraphId) {
      const maingraphData = reactflow.toObject();
      nodes = maingraphData.nodes ?? [];
      edges = maingraphData.edges ?? [];
    } else {
      const graphData = reactflow.toObject();
      graphDataMap.set(graphId, graphData);
      const maingraphData = graphDataMap.get(maingraphId) || {};
      nodes = maingraphData.nodes ?? [];
      edges = maingraphData.edges ?? [];
    }

    return { nodes, edges }
  }

  const getResult = () => {
    const { nodes, edges } = getData();

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

      const BPMNDiagramId = `BPMNDiagram_1`
      const BPMNDiagram = createElement({
        name: "bpmndi:BPMNDiagram",
        id: BPMNDiagramId
      })
      
      const BPMNPlane = createElement({
        name: "bpmndi:BPMNPlane",
        id: `BPMNPlane_1`
      })

      participantNodes.forEach(n => {
        const id = n.id;
        const processId = `Process_${getHash()}`;
        const nodeElement = createNodeElement(n, { processRef: processId });
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
            if (n.type === "subProcess") {
              const subProcessNodeId = id;
              const data = graphDataMap.get(subProcessNodeId) || {};
              add({ nodes: data.nodes ?? [], edges: data.edges ?? [], process: nodeElement, processId: id });
            }
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

          setAttr({ o: BPMNPlane, attrs: { bpmnElement: collaborationId } });
          BPMNPlane.elements.push(...styleElements);
          BPMNDiagram.elements = [BPMNPlane];
          BPMNDiagramMap.set(BPMNDiagramId, BPMNDiagram)
        } else {
          const normalNodes = nodes.filter(n => n.parentId === id && (n.type !== ParticipantHorizontal && n.type !== ParticipantVertical && n.type !== ParticipantLane));

          add({
            nodes: normalNodes,
            edges,
            process,
            parentNode: n,
            processId: collaborationId
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


      definitions.elements = [collaboration, ...processes, ...[...BPMNDiagramMap.values()]];
      // // BPMNDiagram.elements = [BPMNPlane];
      // definitions.elements.push(BPMNDiagram)
    } else {
      const id = 1;
      const processId = `Process_${id}`;
      const process = createElement({ name: "process", id: processId });
      
      add({ nodes, edges, process: process, processId: processId });
      definitions.elements = [process, ...[...BPMNDiagramMap.values()]];
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
    BPMNDiagramMap.clear();
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