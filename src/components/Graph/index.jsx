import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { addEdge, Background, BackgroundVariant, getConnectedEdges, getIncomers, getOutgoers, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react';
import {
  nodes as initialNodes,
  edges as initialEdges,
} from '../../data';
import '@xyflow/react/dist/style.css';
import { Button, Drawer, Form, Input } from 'antd';
import { nodeTypes } from '../../nodeTypes';
import { FlowContext } from '../../context';
import { useDrawerParams } from '../../utils/hooks';

const Graph = () => {
  const DrawerParams =  useDrawerParams();
  const [form] = Form.useForm();

  const showDrawer = (value) => {
    DrawerParams.showModal(value)
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);


  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      console.log('onConnect')
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      console.log(deleted, 'deleted', nodes, edges)
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);

          console.log(incomers, outgoers)
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  const handleDel = (value) => {
    const { id } = value;

    const newNodes = [...nodes];
    const index = nodes.findIndex(node => node.id === id);
    if (index !== -1) {
      newNodes.splice(index, 1);
    }

    setNodes(newNodes);

    // 手动执行
    onNodesDelete([value])
  }

  const handleSubmit = () => {
    const value = form.getFieldsValue();
    console.log(value, 'value')

    const { id } = DrawerParams.params;

    const newNodes = [...nodes];
    const index = nodes.findIndex(node => node.id === id);
    newNodes[index].data.label = value.title;
    setNodes([...newNodes]);
    DrawerParams.hideModal();
  }

  useEffect(() => {
    if (DrawerParams.visible) {
      const info = DrawerParams.params;
      form.setFieldsValue({
        ...DrawerParams.params,
        title: info.data.label
      })
    }
  }, [DrawerParams.visible])

  return (
    <div className='graphWrap'>
      <FlowContext.Provider value={{
        handleDel,
        handleEdit: showDrawer
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
        </ReactFlow>
      </FlowContext.Provider>
      <Drawer title="Basic Drawer" {...DrawerParams.modalProps}>
        <Form form={form}>
          <Form.Item name='title'>
            <Input />
          </Form.Item>
        </Form>
        <div>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </Drawer>
    </div>
  );
}

export default memo(Graph);