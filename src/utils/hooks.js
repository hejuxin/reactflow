import { graphDataMap, maingraphId, setId } from "@/store";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useRef, useState, useEffect } from "react";

/**
 * 自定义drawer hook
 */
export function useDrawerParams() {
  const [visible, setVisible] = useState(false);
  const paramsRef = useRef({});
  const hideModal = useCallback(() => {
    setVisible(false);
    paramsRef.current = {};
  }, []);
  const showModal = useCallback((params) => {
    console.log(params, 'params')
    if (params) {
      paramsRef.current = params;
    }
    setVisible(true);
  }, []);
  return {
    hideModal,
    showModal,
    visible,
    params: paramsRef.current,
    modalProps: {
      open: visible,
      onClose: hideModal,
      maskClosable: false,
      destroyOnClose: true,
    },
  };
}

export function useGraph() {
  const reactflow = useReactFlow();
  const [graphId, setGraphId] = useState(maingraphId);

  const handleGraphIdChange = (id) => {
    const data = reactflow.toObject();
    graphDataMap.set(graphId, data);
    setGraphId(id);
  };

  useEffect(() => {
    setId(graphId);
    if (graphDataMap.has(graphId)) {
      const { nodes, edges } = graphDataMap.get(graphId);
      reactflow.setNodes(nodes);
      reactflow.setEdges(edges);
    } else {
      reactflow?.setNodes([]);
      reactflow?.setEdges([]);
    }
  }, [graphId]);

  return {
    handleGraphIdChange,
    graphId
  }
}