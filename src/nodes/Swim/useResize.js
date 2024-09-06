import { useRef } from "react";
import { useNodes, useReactFlow } from "@xyflow/react";
import { titleWidth, laneMinHeight } from "./utils";

const getHeight = node => {
  return node.measured.height;
}

// export const useResize = (reactflow) => {
export const useResize = (id, parentId) => {
  const reactflow = useReactFlow();

  const nodes = useNodes();
  
  const isTopRef = useRef();
  const isLeftRef = useRef();

  const startSizeRef = useRef();

  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const isFirstNode = id === laneNodes[0].id;
  const isLastNode = id === laneNodes[laneNodes.length - 1].id;

  /**
   * 用于记录移动前的数据
   * @param {*} e 
   */
  const handleResizeStart = e => {
    const currentNode = nodes.find(node => node.id === id);

    // 记录当前node的宽度和高度
    startSizeRef.current = {
      width: currentNode.width ?? currentNode.measured.width,
      height: currentNode.height ?? currentNode.measured.height
    }

    const isTop = e.sourceEvent.target.className.includes('top');
    isTopRef.current = isTop;
    const isLeft = e.sourceEvent.target.className.includes('left');
    isLeftRef.current = isLeft;

    const index = nodes.findIndex(node => node.id === id);

    // if (isTop) {
    //   if (isFirstNode) return;
    //   const needChangeNode = nodes[index - 1];
    //   const diffH = getHeight(needChangeNode) - laneMinHeight;
    //   const currentNodeMaxHeight = getHeight(node) + diffH;
    //   setMaxHeight(() => currentNodeMaxHeight)
    // } else {
    //   if (isLastNode) return;
    //   const needChangeNode = nodes[index + 1];
    //   const diffH = getHeight(needChangeNode) - laneMinHeight;
    //   const currentNodeMaxHeight = getHeight(node) + diffH;
    //   setMaxHeight(() => currentNodeMaxHeight)
    // }
  }


  const computeMaxHeight = () => {
    // 第一个子节点向上缩放时，没有最大高度限制
    if (isFirstNode && isTopRef.current) return;
    // 最后一个子节点向下缩放时，没有最大高度限制
    if (isLastNode && !isTopRef.current) return;

    if (isTopRef.current && !isFirstNode) {
      const needChangeNode = nodes[index - 1];
    }
  }

  /**
   * 用于计算当前node可移动的最大高度
   * @param {*} e 
   * @returns 
   */
  const handleResize = e => {
    const { width: startWidth, height: startHeight } = startSizeRef.current;
    const index = nodes.findIndex(node => node.id === id);

    if (isTopRef.current && !isFirstNode) {
      const needChangeNode = nodes[index - 1];
      const diffH = getHeight(needChangeNode) - laneMinHeight;
      const currentNodeMaxHeight = (node.height ?? startHeight) + diffH;
      if (node.measured.height > currentNodeMaxHeight && !node.maxHeight) {
        reactflow.updateNode(id, (node) => {
          node.maxHeight = currentNodeMaxHeight;
          return { ...node }
        })

        maxHeightRef.current = currentNodeMaxHeight;
        return false;
      }

      return;
    }

    if (!isTopRef.current && !isLastNode) {
      const needChangeNode = nodes[index + 1];
      const diffH = getHeight(needChangeNode) - laneMinHeight;
      const currentNodeMaxHeight = (node.height ?? startHeight) + diffH;
      if (node.measured.height > currentNodeMaxHeight && !node.maxHeight) {
        reactflow.updateNode(id, (node) => {
          node.maxHeight = currentNodeMaxHeight;
          return { ...node }
        })

        maxHeightRef.current = currentNodeMaxHeight;
        return false;
      }

      return;
    }

    // {
    //   if (isLastNode) return;
    //   const needChangeNode = nodes[index + 1];
    //   const diffH = getHeight(needChangeNode) - laneMinHeight;
    //   const currentNodeMaxHeight = getHeight(node) + diffH;
    //   setMaxHeight(() => currentNodeMaxHeight)
    // }
  }

  /**
   * 缩放结束时进行数据处理
   * @param {*} e 
   * @returns 
   */
  const handleResizeEnd = e => {
    const currentNode = nodes.find(node => node.id === id);

    const width = currentNode.measured.width;
    const height = getHeight(currentNode);
    const { width: startWidth, height: startHeight } = startSizeRef.current;

    if (startWidth !== width) {
      if (isLeftRef.current) {
        const diffW = width - startWidth;
        const needChangeNodes = nodes.filter(node => node.id.startsWith(parentId));
        // 左侧拖拽缩放时，需更改父级的x定位
        // 对于所有子泳道，需修改重新x定位。包括自身

        needChangeNodes.forEach(needChangeNode => {
          reactflow.updateNode(needChangeNode.id, (node) => {
            const x = node.position.x;

            if (node.id === parentId) {
              node.width = width + titleWidth;
              node.position.x = x - diffW;
            } else {
              if (node.id !== id) {
                node.width = width;
              }
              node.position.x = titleWidth;
            }
            return { ...node }
          })
        })
      } else {
        const needChangeNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== id);
        needChangeNodes.forEach(needChangeNode => {
          reactflow.updateNode(needChangeNode.id, (node) => {
            if (node.id === parentId) {
              node.width = width + titleWidth;
            } else {
              node.width = width;
            }
            return { ...node }
          })
        })
      }
    }

    if (startHeight !== height) {
      const diffH = height - startHeight;
      // 第一个子节点，且拖拽的是上边框
      if (isFirstNode && isTopRef.current) {
        reactflow.updateNode(parentId, (node) => {
          const height = getHeight(node);
          
          node.height = height + diffH;

          const y = node.position.y;
          node.position.y = y - diffH;
          return { ...node }
        })

        laneNodes.forEach(laneNode => {
          reactflow.updateNode(laneNode.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
            return { ...node }
          })
        })

        // todo 逻辑优化
        // laneNodes.forEach((laneNode, index) => {
        //   const prevLane = index > 0 ? laneNodes[index - 1] : {};
        //   reactflow.updateNode(laneNode.id, (node) => {
        //     if (index === 0) {
        //       node.position.y = 0
        //     } else {
        //       node.position.y = prevLane.position.y + (prevLane.height ?? prevLane.measured.height);
        //     }
        //     // const y = node.position.y;
        //     // node.position.y = y + diffH;
        //     return { ...node }
        //   })
        // })

        return;
      }

      // 最后一个子节点，且拖拽的是下边框
      if (isLastNode && !isTopRef.current) {
        reactflow.updateNode(parentId, (node) => {
          const height = getHeight(node);
          node.height = height + diffH;
          return { ...node }
        })

        return;
      }
      // const index = nodes.findIndex(node => node.id === id);

      // reactflow.updateNode(id, (node) => {
      //   const _node = { ...node };
      //   _node.extent = 'parent';
      //   return _node
      // }, { replace: true })

      // if (isTopRef.current) {
      //   const needChangeNode = nodes[index - 1];
      //   const currentNodeHeight = currentNode.height ?? startHeight;
      //   reactflow.updateNode(needChangeNode.id, (node) => {
      //     const needChangeNodeHeight = getHeight(node);
      //     const newHeight = needChangeNodeHeight - diffH;
      //     if (diffH > 0) {
      //       // diffH > 0 代表当前node是放大。needChangeNode需要缩小
      //       // 高度最小为laneMinHeight
      //       node.height = Math.max(newHeight, laneMinHeight);
      //     } else {
      //       // needChangeNode需要放大
      //       // 高度最大为 当前node缩小到laneMinHeight的落差 + needChangeNode的高度
      //       const needChangeNodeMaxHeight = (currentNodeHeight - laneMinHeight) + needChangeNodeHeight;
      //       console.log(needChangeNodeMaxHeight, 'needChangeNodeMaxHeight')
      //       node.height = Math.min(newHeight, needChangeNodeMaxHeight)
      //     }

      //     return { ...node }
      //   })
      //   return;
      // }
      //  else {
      //   const needChangeNode = nodes[index + 1];
      //   reactflow.updateNode(needChangeNode.id, (node) => {
      //     const currentHeight = getHeight(node);
      //     const newHeight = currentHeight - diffH;
      //     // 高度最小为laneMinHeight
      //     node.height = Math.max(newHeight, laneMinHeight);

      //     const y = node.position.y;
      //     if (newHeight >= laneMinHeight) {
      //       const diffY = diffH;
      //       node.position.y = y + diffY;
      //     } else {
      //       const diffY = diffH - (laneMinHeight - newHeight);
      //       node.position.y = y + diffY;
      //     }
      //     return { ...node }
      //   })
      // }
    }
  }

  return {
    handleResizeStart,
    handleResize,
    handleResizeEnd
  }
}