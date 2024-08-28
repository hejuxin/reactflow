import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addEdge, Background, BackgroundVariant, getConnectedEdges, getIncomers, getOutgoers, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import {
  nodes as initialNodes,
  edges as initialEdges,
} from './data';
import '@xyflow/react/dist/style.css';
import { Drawer } from 'antd';
import { nodeTypes } from './nodeTypes';

export default function App() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([]);


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
      console.log(deleted, 'deleted',nodes, edges)
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

  const onDelete = (value) => {
    const { id } = value;
    console.log(id, 'onDelete',)

    // const newNodes = [...nodes];
    // const index = nodes.findIndex(node => node.id === id);
    // console.log(index, newNodes)

    setNodes((nodes) => {
      const newNodes = [...nodes];
      const index = nodes.findIndex(node => node.id === id);
      console.log(index, newNodes)
      if (index !== -1) {
        newNodes.splice(index, 1)
      }
      return [...newNodes]
    })

    // onNodesDelete([value])
  }

  useEffect(() => {
    const _nodes = initialNodes.map(item => {
      return {
        ...item,
        data: {
          ...item.data,
          handleEdit: showDrawer,
          handleDel: onDelete
        }
      }
    });

    setNodes(_nodes)
  }, []);

  useEffect(() => {
    console.log('nodes change')
  }, [nodes])

  return (
    <div style={{ height: '500px', width: '100%' }}>
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
      <Drawer title="Basic Drawer" onClose={onClose} open={open}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
}