import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  MiniMap,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  Panel,
  useReactFlow
} from "@xyflow/react";
import { nodes as initialNodes, edges as initialEdges } from "@/mock";
import "@xyflow/react/dist/style.css";
import { Breadcrumb, Button, Drawer, Form, Input } from "antd";
import { nodeTypes } from "@/nodes";
import { FlowContext } from "@/context";
import { useDrawerParams, useGraph } from "@/utils/hooks";
import { getHash, getNodeBoundaries, getRectBoundaries } from "@/utils/util";
import { createParticipant, deleteLane, ParticipantLane, ParticipantHorizontal, ParticipantVertical, createParticipantLaneSet } from "@/nodes/Swim/utils";
import { Slider, Toolbar } from "..";
import { maingraphId } from "@/store";

const Graph = () => {
  const DrawerParams = useDrawerParams();
  const [form] = Form.useForm();

  const graphWrapper = useRef();
  const reactflow = useReactFlow();
  const newNodeRef = useRef();

  const { graphId, handleGraphIdChange } = useGraph();

  const showDrawer = (value) => {
    DrawerParams.showModal(value);
  };

  // useEffect(() => {
  //   if (reactflow) {
  //     reactflow.setNodes(initialNodes)
  //     reactflow.setEdges(initialEdges)
  //   }
  // }, [reactflow]);

  const onConnect = useCallback(
    (params) => {
      console.log("onConnect", params);
      reactflow?.setEdges((eds) => addEdge(params, eds));
    },
    [reactflow]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      console.log('onNodesDelete', deleted);

      if (!reactflow) return;
      const nodes = reactflow.getNodes();
      console.log(nodes, 'nodes');

      const edges = reactflow.getEdges();
      reactflow.setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);

          console.log(incomers, outgoers);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );


      if (deleted.length === 1 && deleted[0].type === ParticipantLane) {
        deleteLane({
          id: deleted[0].id,
          reactflow: reactflow
        })
      }
    },
    [reactflow]
  );

  const handleDel = (value) => {
    const { id } = value;

    reactflow.deleteElements({
      nodes: [{ id }]
    })
  };

  const handleSubmit = () => {
    const value = form.getFieldsValue();
    const { id } = DrawerParams.params;

    reactflow.updateNodeData(id, { label: value.title })
    DrawerParams.hideModal();
  };

  useEffect(() => {
    if (DrawerParams.visible) {
      const info = DrawerParams.params;
      form.setFieldsValue({
        ...DrawerParams.params,
        title: info.data.label,
      });
    }
  }, [DrawerParams.visible]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = graphWrapper.current.getBoundingClientRect();
      // 获取节点类型
      const type = event.dataTransfer.getData("application/reactflow");

      // // 使用 screenToFlowPosition 将像素坐标转换为内部 ReactFlow 坐标系
      // todo 拖拽加入坐标不准问题
      const position = reactflow.screenToFlowPosition({
        // x: event.clientX - reactFlowBounds.left,
        // y: event.clientY - reactFlowBounds.top,
        x: event.clientX,
        y: event.clientY,
      });
      const nodes = reactflow.getNodes();
      const participantNode = nodes.find(n => n.type.startsWith("Participant"));

      if (type === ParticipantHorizontal) {
        const participant = createParticipant({ position });
        newNodeRef.current = participant;


        let newNodes = [];
        const boundaries = getRectBoundaries(nodes);
        if (boundaries) {
          const { startX, startY, endX, endY } = boundaries;

          const newPostion = { ...position };
          const newStyle = { width: Number(participant.style.width), height: Number(participant.style.height) };

          if (newPostion.x > startX) {
            newPostion.x = startX;
          }
          if (newPostion.y > startY) {
            newPostion.y = startY;
          }

          if ((newPostion.x + newStyle.width) < endX) {
            newStyle.width = endX;
          }

          if ((newPostion.y + newStyle.height) < endY) {
            console.log(endY - newPostion.y, "dd")
            newStyle.height = endY;
          }

          participant.position = newPostion;
          participant.style = newStyle;

          newNodes = nodes.map(node => {
            const x = node.position.x;
            const y = node.position.y;

            node.position = {
              x: x - newPostion.x,
              y: y - newPostion.y
            }

            node.parentId = participant.id;
            node.extent = "parent";

            return { ...node }
          })
        }

        // if (newPostion.x > startX || (newPostion.x + titleWidth) > startX) {
        //   newPostion.x = startX - titleWidth;
        // }


        // const participantLaneSet = createParticipantLaneSet({ position });
        // reactflow.addNodes([participant, participantLaneSet]);
        reactflow.setNodes([participant, ...newNodes])
      } else if (type === ParticipantVertical) {
        const participant = createParticipant({ position, isHorizontal: false });

        reactflow.addNodes(participant);
        newNodeRef.current = participant;
      } else {
        const id = getHash()
        const newNode = {
          id,
          type,
          position,
          // 传入节点 data
          style: {},
          data: { label: `${type} node` },
          zIndex: 10
        };

        if (participantNode) {
          const { x, y, endX, endY } = getNodeBoundaries(participantNode);
          if (position.x < x || position.x > endX || position.y < y || position.y > endY) return;
          newNode.parentId = participantNode.id;
          newNode.extent = 'parent';
          newNode.zIndex = 10;
          const intersectingNodePos = participantNode.position;
          // 需要调整相对位置。原有位置是相对整个画布的，需调整完相对父级的
          newNode.position = {
            x: position.x - intersectingNodePos.x,
            y: position.y - intersectingNodePos.y
          }
        }

        reactflow.addNodes(newNode)
        newNodeRef.current = newNode;
      }
      // newNodeRef.current = newNode;
      // reactflow?.addNodes(newNode);
    }, [reactflow])

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleNodesChange = (...p) => {
    const info = p[0][0];

    // 当类型为尺寸变化时
    // if (info?.type === 'dimensions') {
    //   // ，判断是否有交集
    //   if (newNodeRef.current && info.id === newNodeRef.current.id) {
    //     const newNode = newNodeRef.current;
    //     newNodeRef.current = null;
    //     const intersectingNodes = reactflow?.getIntersectingNodes({ id: newNode.id }, false);
    //     console.log(newNode.id, intersectingNodes, 'intersectingNodes')

    //     if (intersectingNodes.length) {
    //       // todo 如果有多个交集
    //       console.log(intersectingNodes, 'intersectingNodes');
    //       const intersectingNode = intersectingNodes[0];

    //       reactflow?.updateNode(newNode.id, (node) => {
    //         node.parentId = intersectingNode.id;
    //         node.extent = 'parent';
    //         const position = node.position;
    //         const intersectingNodePos = intersectingNode.position;
    //         // 需要调整相对位置。原有位置是相对整个画布的，需调整完相对父级的
    //         node.position = {
    //           x: position.x - intersectingNodePos.x,
    //           y: position.y - intersectingNodePos.y
    //         }
    //         return { ...node }
    //       }, { replace: true })

    //       // const newNodes = [...nodes];
    //       // newNodes[nodes.length - 1].parentId = intersectingNode.id;
    //       // newNodes[nodes.length - 1].extent = 'parent';
    //       // setNodes([...newNodes]);
    //     }
    //   }

    //   const id = info.id;

    //   // if (node.type === 'swimlanewrap') {
    //   //   const { width } = node;
    //   //   const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

    //   //   laneNodes.forEach(node => {
    //   //     reactflow?.updateNode(node.id, (node) => {
    //   //       node.width = width - titleWidth;
    //   //       node.position.x = titleWidth
    //   //       return { ...node }
    //   //     },{ replace: true })
    //   //   })
    //   // }
    // }

    // if (info.type === 'add') {
    //   const id = info.id;
    //   const intersectingNodes = reactflow?.getIntersectingNodes(info.item, false);
    //   console.log(intersectingNodes, 'handleNodesChange')

    //   // if (intersectingNodes.length) {
    //   //   const {id} = intersectingNodes[0];
    //   //   const newNodes = [...nodes];
    //   //   newNodes[nodes.length - 1].parentId = id;
    //   //   newNodes[nodes.length - 1].extent = 'parent';
    //   //   console.log(id, 'id', newNodes)

    //   //   setNodes([...newNodes]);
    //   // }
    // }
  };

  return (
    <div className="graphWrap" ref={graphWrapper}>
      <FlowContext.Provider
        value={{
          handleDel,
          handleEdit: showDrawer,
          onSubProcessExpand: handleGraphIdChange
        }}
      >
        <ReactFlow
          // nodes={nodes}
          defaultNodes={[]}
          defaultEdges={[]}
          fitView
          onNodesChange={handleNodesChange}
          onNodesDelete={onNodesDelete}
          // onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          minZoom={0.1}
          maxZoom={1}
        >
          {/* <Controls position="top-right" orientation="horizontal"></Controls>
            <MiniMap /> */}
          <Panel position="top-center">
            {graphId !== maingraphId ? (
              <Breadcrumb
                separator=">"
                items={[
                  {
                    title: '主流程',
                    onClick: () => handleGraphIdChange(maingraphId)
                  },
                  {
                    title: graphId
                  },
                ]}
              />
            ) : <></>}
          </Panel>
          {/* <Panel position="top-left" style={{ margin: 0, top: 0, left: 0, height: "100%", display: "flex" }}>
            <Toolbar />
            <Slider />
          </Panel> */}
          <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
        </ReactFlow>
      </FlowContext.Provider>
      <Drawer title="Basic Drawer" {...DrawerParams.modalProps}>
        <Form form={form}>
          <Form.Item name="title">
            <Input />
          </Form.Item>
        </Form>
        <div>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default memo(Graph);
