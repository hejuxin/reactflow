import { useState, useRef } from "react";
import { useNodes, useReactFlow } from "@xyflow/react";
import { titleWidth, laneMinHeight, laneType } from "./utils";

const getHeight = node => {
  return node.measured.height;
}

const initResizedirection = {
  top: false,
  left: false
}
// export const useResize = (reactflow) => {
export const useResize = (id, parentId) => {
  const reactflow = useReactFlow();

  const nodes = useNodes();
  const [maxHeight, setMaxHeight] = useState();

  const resizedirectionRef = useRef(initResizedirection);

  const startSizeRef = useRef();
  const maxHeightRef = useRef();

  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const isFirstNode = id === laneNodes[0].id;
  const isLastNode = id === laneNodes[laneNodes.length - 1].id;

  /**
   * 用于记录移动前的数据
   * @param {*} e 
   */
  const handleResizeStart = (e, params) => {
    const currentNode = reactflow.getNode(id);

    // 记录当前node的宽度和高度
    startSizeRef.current = {
      width: params.width,
      height: params.height
    }

    const isTop = e.sourceEvent.target.className.includes('top');
    const isLeft = e.sourceEvent.target.className.includes('left');

    resizedirectionRef.current = {
      top: isTop,
      left: isLeft
    }




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

    computeMaxHeight(currentNode);
    console.log(currentNode.position.y, 0, currentNode);

    console.log(maxHeightRef.current, 'maxHeightRef.current')
    // if (maxHeightRef.current) {
    //   reactflow.updateNode(id, (node) => {
    //     node.maxHeight = maxHeightRef.current;
    //     return { ...node }
    //   })
    // }
  }

  /**
   * 用于计算当前node可移动的最大高度
   * @param {*} e 
   * @returns 
   */
  const computeMaxHeight = (currentNode) => {
    const { top: isTop } = resizedirectionRef.current;
    // 第一个子节点向上缩放时，没有最大高度限制
    if (isFirstNode && isTop) return;
    // 最后一个子节点向下缩放时，没有最大高度限制
    if (isLastNode && !isTop) return;

    const index = laneNodes.findIndex(node => node.id === id);

    // reactflow.updateNode(id, (node) => {
    //   const _node = { ...node };
    //   _node.extent = 'parent';
    //   return _node
    // }, { replace: true })

    // 向上缩放时，需获取上一个子泳道的高度
    if (isTop && !isFirstNode) {
      // 获取上一个子泳道
      const needChangeNode = laneNodes[index - 1];
      // 获取上一个子泳道的高度
      const needChangeNodeHeight = needChangeNode.height ?? needChangeNode.measured.height;
      // 计算可放大的最大落差高度
      const diffMaxH = needChangeNodeHeight - laneMinHeight;
      const currentNodeMaxHeight = (currentNode.height ?? currentNode.measured.height) + diffMaxH;
      maxHeightRef.current = currentNodeMaxHeight;
      setMaxHeight(() => currentNodeMaxHeight)


      return;
    }

    if (!isTop && !isLastNode) {
      const needChangeNode = laneNodes[index + 1];
      const needChangeNodeHeight = needChangeNode.height ?? needChangeNode.measured.height;
      const diffMaxH = needChangeNodeHeight - laneMinHeight;
      const currentNodeMaxHeight = (currentNode.height ?? currentNode.measured.height) + diffMaxH;
      maxHeightRef.current = currentNodeMaxHeight;
      setMaxHeight(() => currentNodeMaxHeight)

      return;
    }
  }

  const handleResize = e => {
    const { top: isTop } = resizedirectionRef.current;
    // 第一个子节点向上缩放时，没有最大高度限制
    if (isFirstNode && isTop) return;
    // 最后一个子节点向下缩放时，没有最大高度限制
    if (isLastNode && !isTop) return;


    // const { width: startWidth, height: startHeight } = startSizeRef.current;
    // const index = nodes.findIndex(node => node.id === id);

    // if (isTop && !isFirstNode) {
    //   const currentNode = reactflow.getNode(id);
    //   console.log(currentNode.position.y, 1, currentNode)
    //   if (currentNode.measured.height > maxHeightRef.current) {
    //     // reactflow.updateNode(id, (node) => {
    //     //   node.maxHeight = maxHeightRef.current;
    //     //   return { ...node }
    //     // }, { replace: true })
    //     // console.log(currentNode.position.y, 2, currentNode)

    //     // return false


    //     // reactflow.updateNode(id, (node) => {
    //     //     node.height = maxHeightRef.current;
    //     //     return { ...node }
    //     //   }, { replace: true })

    //   }

    //   return;
    // }

    // if (!isTop && !isLastNode) {
    //   const needChangeNode = nodes[index + 1];
    //   const diffH = getHeight(needChangeNode) - laneMinHeight;
    //   const currentNodeMaxHeight = (node.height ?? startHeight) + diffH;
    //   if (node.measured.height > currentNodeMaxHeight && !node.maxHeight) {
    //     reactflow.updateNode(id, (node) => {
    //       node.maxHeight = currentNodeMaxHeight;
    //       return { ...node }
    //     })

    //     maxHeightRef.current = currentNodeMaxHeight;
    //     return false;
    //   }

    //   return;
    // }



    // ----------------
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
  const handleResizeEnd = (e, params) => {
    const { top: isTop, left: isLeft } = resizedirectionRef.current;
    const currentNode = reactflow.getNode(id);

    const width = currentNode.measured.width;
    const height = getHeight(currentNode);
    const { width: startWidth, height: startHeight } = startSizeRef.current;

    if (startWidth !== width) {
      if (isLeft) {
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
          })
        })
      }
    }

    if (startHeight !== height) {
      const diffH = height - startHeight;
      // 第一个子节点，且拖拽的是上边框
      if (isFirstNode && isTop) {
        reactflow.updateNode(parentId, (node) => {
          const height = getHeight(node);

          node.height = height + diffH;

          const y = node.position.y;
          node.position.y = y - diffH;
        })

        laneNodes.forEach(laneNode => {
          reactflow.updateNode(laneNode.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
          })
        })

        const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
        const normalNodes = intersectingNodes.filter(node => node.type !== laneType);

        normalNodes.forEach(intersectingNode => {
          reactflow.updateNode(intersectingNode.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
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
      if (isLastNode && !isTop) {
        reactflow.updateNode(parentId, (node) => {
          const height = getHeight(node);
          node.height = height + diffH;
        })

        return;
      }
      // const index = nodes.findIndex(node => node.id === id);

      // reactflow.updateNode(id, (node) => {
      //   const _node = { ...node };
      //   _node.extent = 'parent';
      //   return _node
      // }, { replace: true })

      const index = laneNodes.findIndex(node => node.id === id);
      if (isTop) {
        const needChangeNode = laneNodes[index - 1];
        const currentNodeHeight = startHeight;
        const needChangeNodeHeight = getHeight(needChangeNode);
        const newHeight = needChangeNodeHeight - diffH;
        reactflow.updateNode(needChangeNode.id, (node) => {
          if (diffH > 0) {
            // diffH > 0 代表当前node是放大。needChangeNode需要缩小
            // 高度最小为laneMinHeight
            node.height = Math.max(newHeight, laneMinHeight);
          } else {
            // needChangeNode需要放大
            // 高度最大为 当前node缩小到laneMinHeight的落差 + needChangeNode的高度
            const needChangeNodeMaxHeight = (currentNodeHeight - laneMinHeight) + needChangeNodeHeight;
            console.log(needChangeNodeMaxHeight, 'needChangeNodeMaxHeight')
            node.height = Math.min(newHeight, needChangeNodeMaxHeight)
          }

        })

        // 放大时限制最大高度
        reactflow.updateNode(id, node => {
          if (diffH > 0) {
            const clientHeight = node.height;

            // 超出最大高度时的处理
            if (clientHeight > maxHeightRef.current) {
              // 将高度设为最大高度
              node.height = maxHeightRef.current;

              // 处理y
              const diff = clientHeight - maxHeightRef.current;
              const clientY = node.position.y;
              node.position.y = clientY + diff;
              
            }
          }
        })

        return;
      }
      if (!isTop) {
        const needChangeNode = laneNodes[index + 1];
        const needChangeNodeHeight = needChangeNode.height ?? getHeight(needChangeNode);
        const newHeight = needChangeNodeHeight - diffH;
        reactflow.updateNode(needChangeNode.id, (node) => {
          // 高度最小为laneMinHeight
          node.height = Math.max(newHeight, laneMinHeight);

          const y = node.position.y;
          if (newHeight >= laneMinHeight) {
            const diffY = diffH;
            node.position.y = y + diffY;
          } else {
            const diffY = diffH - (laneMinHeight - newHeight);
            node.position.y = y + diffY;
          }
        })


        // 放大时限制最大高度
        reactflow.updateNode(id, node => {
          if (diffH > 0) {
            const clientHeight = node.height;

            // 超出最大高度时的处理
            if (clientHeight > maxHeightRef.current) {
              // 将高度设为最大高度
              node.height = maxHeightRef.current;
            }
          }
        })
      }
    }
  }

  const shouldResize = e => {
    // const { left: isLeft } = resizedirectionRef.current;
    // if ((isLeft ?? true) && !maxHeight) return false;
    return true
  }

  return {
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    shouldResize,
    maxHeight
  }
}

export const useResizeWrap = id => {
  const reactflow = useReactFlow();
  const nodes = useNodes();

  const resizedirectionRef = useRef(initResizedirection);
  const startSizeRef = useRef();
  const laneNodes = nodes.filter(node => node.id.startsWith(id) && node.id !== id);

  const handleResizeStart = (e, params) => {
    startSizeRef.current = {
      width: params.width,
      height: params.height
    }

    const isTop = e.sourceEvent.target.className.includes('top');
    const isLeft = e.sourceEvent.target.className.includes('left');

    resizedirectionRef.current = {
      top: isTop,
      left: isLeft
    }
  }

  const handleResizeEnd = e => {
    const {
      top: isTop,
      left: isLeft
    } = resizedirectionRef.current;
    const node = nodes.find(node => node.id === id);
    const width = node.measured.width;
    const height = node.measured.height;
    const { width: startWidth, height: startHeight } = startSizeRef.current;


    if (startWidth !== width) {
      if (isLeft) {
        const diffW = width - startWidth;

        laneNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
            node.width = width - titleWidth;
            node.position.x = titleWidth;

            return { ...node }
          })
        })
      } else {
        laneNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
            node.width = width - titleWidth;
            return { ...node }
          })
        })
      }
    }

    if (startHeight !== height) {
      const diffH = height - startHeight;
      if (isTop) {
        const needChangeNode = laneNodes[0];
        reactflow.updateNode(needChangeNode.id, node => {
          const height = node.height ?? node.measured.height;
          node.height = height + diffH;
          node.position.y = 0;
        })
      } else {
        const needChangeNode = laneNodes[laneNodes.length - 1];
        reactflow.updateNode(needChangeNode.id, node => {
          const height = node.height ?? node.measured.height;
          node.height = height + diffH;
        })
      }
    }
  }

  return {
    handleResizeStart,
    handleResizeEnd
  }
}