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
  ControlButton,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { nodes as initialNodes, edges as initialEdges } from "@/mock";
import "@xyflow/react/dist/style.css";
import { Button, Drawer, Form, Input } from "antd";
import { nodeTypes } from "@/nodes";
import { FlowContext } from "@/context";
import { useDrawerParams } from "@/utils/hooks";
import { getHash } from "@/utils/util";
import { createSwimLaneNode } from "@/nodes/Swim/utils";

const Graph = () => {
  const DrawerParams = useDrawerParams();
  const [form] = Form.useForm();

  const graphWrapper = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const newNodeRef = useRef();

  const showDrawer = (value) => {
    DrawerParams.showModal(value);
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      console.log("onConnect");
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      console.log(deleted, "deleted", nodes, edges);
      setEdges(
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
    },
    [nodes, edges]
  );

  const handleDel = (value) => {
    const { id } = value;

    const newNodes = [...nodes];
    const index = nodes.findIndex((node) => node.id === id);
    if (index !== -1) {
      newNodes.splice(index, 1);
    }

    setNodes(newNodes);

    // 手动执行
    onNodesDelete([value]);
  };

  const handleSubmit = () => {
    const value = form.getFieldsValue();
    console.log(value, "value");

    const { id } = DrawerParams.params;

    const newNodes = [...nodes];
    const index = nodes.findIndex((node) => node.id === id);
    newNodes[index].data.label = value.title;
    setNodes([...newNodes]);
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
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      if (type === 'swimwrap') {
        const swimLaneNode = createSwimLaneNode({ position });
        setNodes(nodes => {
          return nodes.concat(swimLaneNode);
        })
        newNodeRef.current = swimLaneNode[0];
      } else {
        const id = getHash()
        const newNode = {
          id,
          type,
          position,
          // 传入节点 data
          data: { label: `${type} node` },
          zIndex: 10
        };

        setNodes((nodes) => {
          nodes.push(newNode);
          return [...nodes];
        })
        newNodeRef.current = newNode;
      }
      // newNodeRef.current = newNode;
      // reactFlowInstance?.addNodes(newNode);
    }, [reactFlowInstance, nodes, setNodes])

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onInit = (instance) => {
    console.log("onInit");
    setReactFlowInstance(instance);
  };

  const handleNodesChange = (...p) => {
    onNodesChange(...p)
    const info = p[0][0];

    // 当类型为尺寸变化时
    if (info?.type === 'dimensions') {
      // ，判断是否有交集
      if (newNodeRef.current && info.id === newNodeRef.current.id) {
        const newNode = newNodeRef.current;
        newNodeRef.current = null;
        const intersectingNodes = reactFlowInstance?.getIntersectingNodes({ id: newNode.id }, false);
        console.log(newNode.id, intersectingNodes, 'intersectingNodes')

        if (intersectingNodes.length) {
          // todo 如果有多个交集
          const intersectingNode = intersectingNodes[0];

          reactFlowInstance?.updateNode(newNode.id, (node) => {
            node.parentId = intersectingNode.id;
            node.extent = 'parent';
            const position = node.position;
            const intersectingNodePos = intersectingNode.position;
            // 需要调整相对位置。原有位置是相对整个画布的，需调整完相对父级的
            node.position = {
              x: position.x - intersectingNodePos.x,
              y: position.y - intersectingNodePos.y
            }
            return { ...node }
          }, { replace: true })

          // const newNodes = [...nodes];
          // newNodes[nodes.length - 1].parentId = intersectingNode.id;
          // newNodes[nodes.length - 1].extent = 'parent';
          // setNodes([...newNodes]);
        }
      }

      const id = info.id;
      const node = nodes.find(node => node.id === id);

      // if (node.type === 'swimlanewrap') {
      //   const { width } = node;
      //   const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

      //   laneNodes.forEach(node => {
      //     reactFlowInstance?.updateNode(node.id, (node) => {
      //       node.width = width - titleWidth;
      //       node.position.x = titleWidth
      //       return { ...node }
      //     },{ replace: true })
      //   })
      // }
    }

    // if (info.type === 'add') {
    //   const id = info.id;
    //   const intersectingNodes = reactFlowInstance?.getIntersectingNodes(info.item, false);
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
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodesChange={handleNodesChange}
            onNodesDelete={onNodesDelete}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={onInit}
            minZoom={0.1}
            maxZoom={1}
          >
            <Controls position="top-right" orientation="horizontal">
              {/* <ControlButton
                onClick={() => alert("Something magical just happened. ✨")}
              ></ControlButton> */}
            </Controls>
            <MiniMap />
            <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
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
      <Button
        onClick={() => {
          console.log(reactFlowInstance.toObject());
        }}
      >
        output
      </Button>
    </div>
  );
};

export default memo(Graph);
