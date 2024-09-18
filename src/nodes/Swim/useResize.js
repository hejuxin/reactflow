import { useState, useRef } from "react";
import { useNodes, useReactFlow } from "@xyflow/react";
import { titleWidth, ParticipantHorizontalLaneSize, ParticipantVerticalLaneSize, ParticipantLane, ParticipantHorizontal, getLaneNodes, getIsHorizontal, getNodeSize } from "./utils";

const getHeight = node => {
  return node.measured.height;
}

const getWidth = node => {
  return node.measured.width;
}

const initiationDirection = {
  isHorizontal: false,
  isVertical: false,
  affectsLeft: false,
  affectsTop: false,
}

function getControlDirection(controlPosition) {
  const isHorizontal = controlPosition.includes('right') || controlPosition.includes('left');
  const isVertical = controlPosition.includes('bottom') || controlPosition.includes('top');
  const affectsLeft = controlPosition.includes('left');
  const affectsTop = controlPosition.includes('top');

  return {
    isHorizontal,
    isVertical,
    affectsLeft,
    affectsTop,
  };
}
export const useResize = (id, parentId) => {
  const reactflow = useReactFlow();

  const nodes = useNodes();
  const currentNode = reactflow?.getNode(id);
  const [maxHeight, setMaxHeight] = useState();

  const resizedirectionRef = useRef(initiationDirection);

  // 记录开始的width和height
  const startSizeRef = useRef();

  const isHorizontalLane = getIsHorizontal({ parentId, reactflow });
  const laneMinWidth = isHorizontalLane ? ParticipantHorizontalLaneSize.minWidth : ParticipantVerticalLaneSize.minWidth;
  const laneMinHeight = isHorizontalLane ? ParticipantHorizontalLaneSize.minHeight : ParticipantVerticalLaneSize.minHeight;

  // 边界
  const boundariesRef = useRef({
    minWidth: laneMinWidth,
    minHeight: laneMinHeight,
  });


  const intersectingNodesRef = useRef([]);

  const laneNodes = getLaneNodes({ nodes, parentId });
  const isFirstNode = id === laneNodes[0].id;
  const isLastNode = id === laneNodes[laneNodes.length - 1].id;


  const setBoundaries = (key, value) => {
    boundariesRef.current[key] = value;
  }

  /**
   * 用于记录移动前的数据
   * @param {*} e 
   */
  const handleResizeStart = (e, params) => {

    // 记录当前node的初始信息（宽高和位置）
    startSizeRef.current = params;

    // 根据className判断拖拽方向
    const className = e.sourceEvent.target.className;
    const direction = getControlDirection(className);
    resizedirectionRef.current = direction;

    if (direction.isHorizontal) {
      // 若横向有变化，记录的是容器的交叉node
      const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
      intersectingNodesRef.current = intersectingNodes.filter(node => node.type !== ParticipantLane);
    } else {
      // 记录当前子泳道的交叉node
      const intersectingNodes = reactflow.getIntersectingNodes({ id }, true);
      intersectingNodesRef.current = intersectingNodes.filter(node => node.type !== ParticipantHorizontal);
    }

    if (isHorizontalLane) {
      computeMaxHeight();
    } else {
      computeMaxWidth();
    }
  }

  /**
   * 用于计算当前node可移动的最大宽度
   * @param {*} e 
   * @returns 
   */
  const computeMaxWidth = () => {
    const {
      isHorizontal,
      affectsLeft,
    } = resizedirectionRef.current;
    const isLeftDirection = isHorizontal && affectsLeft;
    const isRightDirection = isHorizontal && !affectsLeft;
    // 第一个子节点向左缩放时，没有最大高度限制
    if (isFirstNode && isLeftDirection) return;
    // 最后一个子节点向右缩放时，没有最大高度限制
    if (isLastNode && isRightDirection) return;

    const index = laneNodes.findIndex(node => node.id === id);

    // 向左缩放时，需获取上一个子泳道的高度。默认为向左
    let needChangeNode = laneNodes[index - 1];

    if (isRightDirection && !isLastNode) {
      needChangeNode = laneNodes[index + 1];
    }

    // 获取上一个子泳道的高度
    const needChangeNodeWidth = getNodeSize({ node: needChangeNode, sizeKey: 'width' });
    // 计算可放大的最大落差高度
    const diffMaxH = needChangeNodeWidth - laneMinWidth;
    const currentNodeMaxWidth = getNodeSize({ node: currentNode, sizeKey: 'width' }) + diffMaxH;

    console.log(currentNodeMaxWidth, 'currentNodeMaxWidth')
    setBoundaries('maxWidth', currentNodeMaxWidth);
  }

  /**
   * 用于计算当前node可移动的最大高度
   * @param {*} e 
   * @returns 
   */
  const computeMaxHeight = () => {
    const {
      isVertical,
      affectsTop,
    } = resizedirectionRef.current;
    const isTopDirection = isVertical && affectsTop;
    const isBottomDirection = isVertical && !affectsTop;
    // 第一个子节点向上缩放时，没有最大高度限制
    if (isFirstNode && isTopDirection) return;
    // 最后一个子节点向下缩放时，没有最大高度限制
    if (isLastNode && isBottomDirection) return;

    const index = laneNodes.findIndex(node => node.id === id);

    // 向上缩放时，需获取上一个子泳道的高度
    if (isTopDirection && !isFirstNode) {
      // 获取上一个子泳道
      const needChangeNode = laneNodes[index - 1];
      // 获取上一个子泳道的高度
      const needChangeNodeHeight = needChangeNode.height ?? needChangeNode.measured.height;
      // 计算可放大的最大落差高度
      const diffMaxH = needChangeNodeHeight - laneMinHeight;
      const currentNodeMaxHeight = (currentNode.height ?? currentNode.measured.height) + diffMaxH;

      setBoundaries('maxHeight', currentNodeMaxHeight);
      setMaxHeight(() => currentNodeMaxHeight)


      return;
    }

    if (isBottomDirection && !isLastNode) {
      const needChangeNode = laneNodes[index + 1];
      const needChangeNodeHeight = needChangeNode.height ?? needChangeNode.measured.height;
      const diffMaxH = needChangeNodeHeight - laneMinHeight;
      const currentNodeMaxHeight = (currentNode.height ?? currentNode.measured.height) + diffMaxH;
      setBoundaries('maxHeight', currentNodeMaxHeight);
      setMaxHeight(() => currentNodeMaxHeight)

      return;
    }
  }

  const handleResize = e => {
    const {
      isVertical,
      affectsTop,
    } = resizedirectionRef.current;

    const maxHeight = boundariesRef.current.maxHeight;
    // 第一个子节点向上缩放时，没有最大高度限制
    if (isFirstNode && isVertical && affectsTop) return;
    // 最后一个子节点向下缩放时，没有最大高度限制
    if (isLastNode && isVertical && !affectsTop) return;
  }

  const onWidthChange = () => {
    const { isHorizontal, affectsLeft } = resizedirectionRef.current;
    const isLeftDirection = isHorizontal && affectsLeft;

    const width = currentNode.measured.width;
    const { width: startWidth, x: startX } = startSizeRef.current;
    const diffW = width - startWidth;

    if (isLeftDirection) {
      if (diffW < 0) {
        const intersectingNodes = intersectingNodesRef.current;
        // 获取最小的x,即最左的x
        const positionXArr = intersectingNodes.map(node => ({ left: node.position.x, right: node.position.x + (node.width ?? node.measured.width) }));
        const positionLeftArr = positionXArr.map(postion => postion.left);
        const positionRightArr = positionXArr.map(postion => postion.right);
        const minX = Math.min(...positionLeftArr);
        const maxX = Math.max(...positionRightArr);

        const maxDiffWidth = Math.abs(startX - minX);
        let newWidth = width;
        const newMinWidth = startWidth - maxDiffWidth;
        const currentMinWidth = boundariesRef.current.minWidth;
        const minWidth = newMinWidth > currentMinWidth ? newMinWidth : currentMinWidth;

        if (newWidth < minWidth) {
          newWidth = minWidth;
          let diff = newWidth - startWidth;

          const newLeft = reactflow.getNode(parentId).x - diff;
          const newRight = newLeft + newWidth + titleWidth;

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            node.width = newWidth + titleWidth;

            const x = node.position.x;
            const newx = x - diff;
            node.position.x = newx;

            handleWrapWidthChangeEffect({
              width: newWidth + titleWidth,
              oldx: x,
              newx
            })
          })


          return;
        }
      }

      reactflow.updateNode(parentId, node => {
        node.width = width + titleWidth;
        const x = node.position.x;
        const newx = x - diffW;
        node.position.x = newx;

        handleWrapWidthChangeEffect({
          width: width + titleWidth,
          oldx: x,
          newx
        })
      })


    } else {
      if (diffW < 0) {
        const intersectingNodes = intersectingNodesRef.current;
        // 获取最小的x,即最左的x
        const positionXArr = intersectingNodes.map(node => ({ left: node.position.x, right: node.position.x + (node.width ?? node.measured.width) }));
        const positionLeftArr = positionXArr.map(postion => postion.left);
        const positionRightArr = positionXArr.map(postion => postion.right);
        const minX = Math.min(...positionLeftArr);
        const maxX = Math.max(...positionRightArr);

        const maxDiffWidth = Math.abs((startX + startWidth) - maxX);
        let newWidth = width;
        const newMinWidth = startWidth - maxDiffWidth;
        const currentMinWidth = boundariesRef.current.minWidth;
        const minWidth = newMinWidth > currentMinWidth ? newMinWidth : currentMinWidth;

        if (newWidth < minWidth) {
          newWidth = minWidth;
          let diff = newWidth - startWidth;

          const newLeft = reactflow.getNode(parentId).x - diff;
          const newRight = newLeft + newWidth + titleWidth;

          // if (newRight < maxX) {
          //   return;
          // }

          // reactflow.updateNode(id, node => {
          //   node.width = newWidth;
          // })

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            node.width = newWidth + titleWidth;
            handleWrapWidthChangeEffect({
              width: newWidth + titleWidth
            })
          })

          return;
        }
      }
      reactflow.updateNode(parentId, node => {
        node.width = width + titleWidth;
        handleWrapWidthChangeEffect({
          width: width + titleWidth
        })
      })
    }
  }

  const onWidthChangeVertical = () => {
    const {
      isHorizontal,
      affectsLeft,
    } = resizedirectionRef.current;
    const isLeftDirection = isHorizontal && affectsLeft;
    const isRightDirection = isHorizontal && !affectsLeft;

    const width = getWidth(currentNode);
    const { width: startWidth, x: startX } = startSizeRef.current;
    const diffW = width - startWidth;

    console.log('onWidthChangeVertical', resizedirectionRef.current)
    console.log(diffW, 'diffW')

    console.log(isFirstNode, 'isFirstNode')

    // 第一个子节点，且拖拽的是上边框
    if (isFirstNode && isLeftDirection) {
      if (diffW > 0) { // 高度增加时


        // 更新容器的高度和位置
        reactflow.updateNode(parentId, (node) => {
          const width = getWidth(node);

          node.width = width + diffW;

          const x = node.position.x;
          node.position.x = x - diffW;
        })

        // 更新所有子泳道的位置
        laneNodes.forEach(laneNode => {
          reactflow.updateNode(laneNode.id, (node) => {
            const x = node.position.x;
            node.position.x = x + diffW;
          })
        })

        // 更新所有除子泳道的node的位置
        const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
        const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

        normalNodes.forEach(intersectingNode => {
          reactflow.updateNode(intersectingNode.id, (node) => {
            const x = node.position.x;
            node.position.x = x + diffW;
          })
        })
      } else { // 高度减小时
        const intersectingNodes = intersectingNodesRef.current;

        // 获取最小的y,即最高的y
        const postionXArr = intersectingNodes.map(node => node.position.x);
        const minX = Math.min(...postionXArr);

        const maxDiffWidth = Math.abs(startX - minX);
        let newWidth = width;
        const newMinWidth = startWidth - maxDiffWidth;
        const currentMinWidth = boundariesRef.current.minWidth;
        const minWidth = newMinWidth > currentMinWidth ? newMinWidth : currentMinWidth;
        // setBoundaries('minWidth', minWidth);


        if (newWidth > minWidth) {
          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const width = getWidth(node);

            node.width = width + diffW;

            const x = node.position.x;
            node.position.x = x - diffW;
          })

          // 更新所有子泳道的位置
          laneNodes.forEach(laneNode => {
            reactflow.updateNode(laneNode.id, (node) => {
              const x = node.position.x;
              node.position.x = x + diffW;
            })
          })

          // 更新所有除子泳道的node的位置
          const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
          const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

          normalNodes.forEach(intersectingNode => {
            reactflow.updateNode(intersectingNode.id, (node) => {
              const x = node.position.x;
              node.position.x = x + diffW;
            })
          })
        } else {
          newWidth = minWidth;
          let diff = newWidth - startWidth;

          reactflow.updateNode(id, node => {
            node.width = newWidth;
            node.position.x = 0;
          })

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const width = getWidth(node);

            node.width = width + diff;

            const x = node.position.x;
            node.position.x = x - diff;
          })

          // 更新所有除子泳道的node的位置
          const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
          const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

          normalNodes.forEach(intersectingNode => {
            reactflow.updateNode(intersectingNode.id, (node) => {
              const x = node.position.x;
              node.position.x = x + diff;
            })
          })

          laneNodes.filter(node => node.id !== id).forEach(laneNode => {
            reactflow.updateNode(laneNode.id, (node) => {
              const x = node.position.x;
              node.position.x = x + diff;
            })
          })
        }
      }
      return;
    }

    // 最后一个子节点，且拖拽的是下边框
    if (isLastNode && isRightDirection) {
      if (diffW < 0) { // 高度减小时
        const intersectingNodes = intersectingNodesRef.current;

        // 获取最大的y,即最下面的y
        const postionXArr = intersectingNodes.map(node => node.position.x + (node.width ?? node.measured.width));
        const maxX = Math.max(...postionXArr);


        const maxDiffWidth = Math.abs(startX + startWidth - maxX);

        let newWidth = width;
        const newMinWidth = startWidth - maxDiffWidth;
        const currentMinWidth = boundariesRef.current.minWidth;
        const minWidth = newMinWidth > currentMinWidth ? newMinWidth : currentMinWidth;

        if (newWidth < minWidth) {
          newWidth = minWidth;
          let diff = newWidth - startWidth;

          reactflow.updateNode(id, node => {
            node.width = newWidth;
          })

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const width = getWidth(node);
            node.width = width + diff;
          })

          return;
        }
      }
      reactflow.updateNode(parentId, (node) => {
        const width = getWidth(node);
        node.width = width + diffW;
      })

      return;
    }

    const index = laneNodes.findIndex(node => node.id === id);
    if (isLeftDirection) {
      const needChangeNode = laneNodes[index - 1];
      const currentNodeWidth = startWidth;
      const needChangeNodeWidth = getWidth(needChangeNode);
      const newWidth = needChangeNodeWidth - diffW;

      console.log(newWidth, 'ddd', Math.max(newWidth, laneMinWidth))
      reactflow.updateNode(needChangeNode.id, (node) => {
        if (diffW > 0) {
          // diffW > 0 代表当前node是放大。needChangeNode需要缩小
          // 高度最小为laneMinWidth
          node.width = Math.max(newWidth, laneMinWidth);
        } else {
          // needChangeNode需要放大
          // 高度最大为 当前node缩小到laneMinWidth的落差 + needChangeNode的高度
          const needChangeNodeMaxWidth = (currentNodeWidth - laneMinWidth) + needChangeNodeWidth;
          console.log(needChangeNodeMaxWidth, 'needChangeNodeMaxWidth')
          node.width = Math.min(newWidth, needChangeNodeMaxWidth)
        }

      })

      // 放大时限制最大高度
      reactflow.updateNode(id, node => {
        if (diffW > 0) {
          const clientWidth = node.width;
          const maxWidth = boundariesRef.current.maxWidth;

          // 超出最大高度时的处理
          if (clientWidth > maxWidth) {
            // 将高度设为最大高度
            node.width = maxWidth;

            // 处理y
            const diff = clientWidth - maxWidth;
            const clientX = node.position.x;
            node.position.x = clientX + diff;

          }
        }
      })

      return;
    }
    if (isRightDirection) {
      const needChangeNode = laneNodes[index + 1];
      const needChangeNodeWidth = needChangeNode.width ?? getWidth(needChangeNode);
      const newWidth = needChangeNodeWidth - diffW;
      reactflow.updateNode(needChangeNode.id, (node) => {
        // 高度最小为laneMinWidth
        node.width = Math.max(newWidth, laneMinWidth);

        const x = node.position.x;
        if (newWidth >= laneMinWidth) {
          const diffX = diffW;
          node.position.x = x + diffX;
        } else {
          const diffX = diffW - (laneMinWidth - newWidth);
          node.position.x = x + diffX;
        }
      })


      // 放大时限制最大高度
      reactflow.updateNode(id, node => {
        if (diffW > 0) {
          const clientWidth = node.width;

          const maxWidth = boundariesRef.current.maxWidth;

          // 超出最大高度时的处理
          if (clientWidth > maxWidth) {
            // 将高度设为最大高度
            node.width = maxWidth;
          }
        }
      })
    }
  }


  const onHeightChange = () => {
    const { isVertical, affectsTop } = resizedirectionRef.current;
    const isTopDirection = isVertical && affectsTop;
    const isBottomDirection = isVertical && !affectsTop;

    const height = getHeight(currentNode);
    const { height: startHeight, y: startY } = startSizeRef.current;
    const diffH = height - startHeight;

    // 第一个子节点，且拖拽的是上边框
    if (isFirstNode && isTopDirection) {
      if (diffH > 0) { // 高度增加时

        // 更新容器的高度和位置
        reactflow.updateNode(parentId, (node) => {
          const height = getHeight(node);

          node.height = height + diffH;

          const y = node.position.y;
          node.position.y = y - diffH;
        })

        // 更新所有子泳道的位置
        laneNodes.forEach(laneNode => {
          reactflow.updateNode(laneNode.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
          })
        })

        // 更新所有除子泳道的node的位置
        const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
        const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

        normalNodes.forEach(intersectingNode => {
          reactflow.updateNode(intersectingNode.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
          })
        })
      } else { // 高度减小时
        const intersectingNodes = intersectingNodesRef.current;

        // 获取最小的y,即最高的y
        const postionYArr = intersectingNodes.map(node => node.position.y);
        const minY = Math.min(...postionYArr);

        const maxDiffHeight = Math.abs(startY - minY);
        let newHeight = height;
        const newMinHeight = startHeight - maxDiffHeight;
        const currentMinHeight = boundariesRef.current.minHeight;
        const minHeight = newMinHeight > currentMinHeight ? newMinHeight : currentMinHeight;
        // setBoundaries('minHeight', minHeight);


        if (newHeight > minHeight) {
          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const height = getHeight(node);

            node.height = height + diffH;

            const y = node.position.y;
            node.position.y = y - diffH;
          })

          // 更新所有子泳道的位置
          laneNodes.forEach(laneNode => {
            reactflow.updateNode(laneNode.id, (node) => {
              const y = node.position.y;
              node.position.y = y + diffH;
            })
          })

          // 更新所有除子泳道的node的位置
          const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
          const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

          normalNodes.forEach(intersectingNode => {
            reactflow.updateNode(intersectingNode.id, (node) => {
              const y = node.position.y;
              node.position.y = y + diffH;
            })
          })
        } else {
          newHeight = minHeight;
          let diff = newHeight - startHeight;

          reactflow.updateNode(id, node => {
            node.height = newHeight;
            node.position.y = 0;
          })

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const height = getHeight(node);

            node.height = height + diff;

            const y = node.position.y;
            node.position.y = y - diff;
          })

          // 更新所有除子泳道的node的位置
          const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true);
          const normalNodes = intersectingNodes.filter(node => node.type !== ParticipantLane);

          normalNodes.forEach(intersectingNode => {
            reactflow.updateNode(intersectingNode.id, (node) => {
              const y = node.position.y;
              node.position.y = y + diff;
            })
          })

          laneNodes.filter(node => node.id !== id).forEach(laneNode => {
            reactflow.updateNode(laneNode.id, (node) => {
              const y = node.position.y;
              node.position.y = y + diff;
            })
          })
        }
      }
      return;
    }

    // 最后一个子节点，且拖拽的是下边框
    if (isLastNode && isBottomDirection) {
      if (diffH < 0) { // 高度减小时
        const intersectingNodes = intersectingNodesRef.current;

        // 获取最大的y,即最下面的y
        const postionYArr = intersectingNodes.map(node => node.position.y + (node.height ?? node.measured.height));
        const maxY = Math.max(...postionYArr);


        const maxDiffHeight = Math.abs(startY + startHeight - maxY);

        let newHeight = height;
        const newMinHeight = startHeight - maxDiffHeight;
        const currentMinHeight = boundariesRef.current.minHeight;
        const minHeight = newMinHeight > currentMinHeight ? newMinHeight : currentMinHeight;

        if (newHeight < minHeight) {
          newHeight = minHeight;
          let diff = newHeight - startHeight;

          reactflow.updateNode(id, node => {
            node.height = newHeight;
          })

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            const height = getHeight(node);
            node.height = height + diff;
          })

          return;
        }
      }
      reactflow.updateNode(parentId, (node) => {
        const height = getHeight(node);
        node.height = height + diffH;
      })

      return;
    }

    const index = laneNodes.findIndex(node => node.id === id);
    if (isTopDirection) {
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
          const maxHeight = boundariesRef.current.maxHeight;

          // 超出最大高度时的处理
          if (clientHeight > maxHeight) {
            // 将高度设为最大高度
            node.height = maxHeight;

            // 处理y
            const diff = clientHeight - maxHeight;
            const clientY = node.position.y;
            node.position.y = clientY + diff;

          }
        }
      })

      return;
    }
    if (isBottomDirection) {
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

          const maxHeight = boundariesRef.current.maxHeight;

          // 超出最大高度时的处理
          if (clientHeight > maxHeight) {
            // 将高度设为最大高度
            node.height = maxHeight;
          }
        }
      })
    }
  }

  const onHeightChangeVertical = () => {
    const { isVertical, affectsTop } = resizedirectionRef.current;
    const isTopDirection = isVertical && affectsTop;

    const height = currentNode.measured.height;
    const { height: startHeight, y: startY } = startSizeRef.current;
    const diffH = height - startHeight;

    if (isTopDirection) {
      if (diffH < 0) {
        const intersectingNodes = intersectingNodesRef.current;
        // 获取最小的x,即最左的x
        const positionYArr = intersectingNodes.map(node => ({ left: node.position.y, right: node.position.y + (node.height ?? node.measured.height) }));
        const positionLeftArr = positionYArr.map(postion => postion.left);
        const positionRightArr = positionYArr.map(postion => postion.right);
        const minY = Math.min(...positionLeftArr);
        const maxX = Math.max(...positionRightArr);

        const maxDiffHeight = Math.abs(startY - minY);
        let newHeight = height;
        const newMinHeight = startHeight - maxDiffHeight;
        const currentMinHeight = boundariesRef.current.minHeight;
        const minHeight = newMinHeight > currentMinHeight ? newMinHeight : currentMinHeight;

        if (newHeight < minHeight) {
          newHeight = minHeight;
          let diff = newHeight - startHeight;

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            node.height = newHeight + titleWidth;

            const y = node.position.y;
            const newy = y - diff;
            node.position.y = newy;

            handleWrapHeightChangeEffect({
              height: newHeight + titleWidth,
              oldy: y,
              newy
            })
          })


          return;
        }
      }

      reactflow.updateNode(parentId, node => {
        node.height = height + titleWidth;
        const y = node.position.y;
        const newy = y - diffH;
        node.position.y = newy;

        handleWrapHeightChangeEffect({
          height: height + titleWidth,
          oldy: y,
          newy
        })
      })


    } else {
      if (diffH < 0) {
        const intersectingNodes = intersectingNodesRef.current;
        // 获取最小的x,即最左的x
        const positionYArr = intersectingNodes.map(node => ({ left: node.position.y, right: node.position.y + (node.height ?? node.measured.height) }));
        const positionLeftArr = positionYArr.map(postion => postion.left);
        const positionRightArr = positionYArr.map(postion => postion.right);
        const minY = Math.min(...positionLeftArr);
        const maxX = Math.max(...positionRightArr);

        const maxDiffHeight = Math.abs((startY + startHeight) - maxX);
        let newHeight = height;
        const newMinHeight = startHeight - maxDiffHeight;
        const currentMinHeight = boundariesRef.current.minHeight;
        const minHeight = newMinHeight > currentMinHeight ? newMinHeight : currentMinHeight;

        if (newHeight < minHeight) {
          newHeight = minHeight;

          // 更新容器的高度和位置
          reactflow.updateNode(parentId, (node) => {
            node.height = newHeight + titleWidth;
            handleWrapHeightChangeEffect({
              height: newHeight + titleWidth
            })
          })

          return;
        }
      }
      reactflow.updateNode(parentId, node => {
        node.height = height + titleWidth;
        handleWrapHeightChangeEffect({
          height: height + titleWidth
        })
      })
    }
  }

  /**
   * 缩放结束时进行数据处理
   * @param {*} e 
   * @returns 
   */
  const handleResizeEnd = (e, params) => {
    const width = currentNode.measured.width;
    const height = getHeight(currentNode);
    const { width: startWidth, height: startHeight } = startSizeRef.current;

    if (startWidth !== width) {
      if (isHorizontalLane) {
        onWidthChange()
      } else {
        onWidthChangeVertical()
      }
    }

    if (startHeight !== height) {
      if (isHorizontalLane) {
        onHeightChange()
      } else {
        onHeightChangeVertical()
      }
    }
  }

  const handleWrapWidthChangeEffect = ({ width, oldx = 0, newx = 0 }) => {
    const isPositionChange = (newx - oldx) !== 0;
    laneNodes.forEach(laneNode => {
      reactflow.updateNode(laneNode.id, (node) => {
        node.width = width - titleWidth;
        if (isPositionChange) {
          node.position.x = titleWidth;
        }
      })
    })

    if (isPositionChange) {
      // 更新所有除子泳道的node的位置
      const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true).filter(node => node.type !== ParticipantLane && node.parentId === parentId);

      intersectingNodes.forEach(intersectingNode => {
        reactflow.updateNode(intersectingNode.id, (node) => {
          const x = node.position.x;
          const diff = newx - oldx;
          node.position.x = x - diff;
          // node.origin = [0, 0];
        })
      })
    }
  }

  const handleWrapHeightChangeEffect = ({ height, oldy = 0, newy = 0 }) => {
    const isPositionChange = (newy - oldy) !== 0;
    laneNodes.forEach(laneNode => {
      reactflow.updateNode(laneNode.id, (node) => {
        node.height = height - titleWidth;
        if (isPositionChange) {
          node.position.y = titleWidth;
        }
      })
    })

    if (isPositionChange) {
      // 更新所有除子泳道的node的位置
      const intersectingNodes = reactflow.getIntersectingNodes({ id: parentId }, true).filter(node => node.type !== ParticipantLane && node.parentId === parentId);

      intersectingNodes.forEach(intersectingNode => {
        reactflow.updateNode(intersectingNode.id, (node) => {
          const y = node.position.y;
          const diff = newy - oldy;
          node.position.y = y - diff;
          // node.origin = [0, 0];
        })
      })
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

  const resizedirectionRef = useRef(initiationDirection);
  const startSizeRef = useRef();
  const intersectingNodesRef = useRef();
  const laneNodes = getLaneNodes({ nodes, parentId: id });

  const currentNode = reactflow.getNode(id);

  const isHorizontalLane = currentNode.type === ParticipantHorizontal;

  const handleResizeStart = (e, params) => {
    // 记录当前node的初始信息（宽高和位置）
    startSizeRef.current = params;

    // 根据className判断拖拽方向
    const className = e.sourceEvent.target.className;
    const direction = getControlDirection(className);
    resizedirectionRef.current = direction;

    // 记录当前子泳道的交叉node
    const intersectingNodes = reactflow.getIntersectingNodes({ id }, true);
    intersectingNodesRef.current = intersectingNodes.filter(node => node.type !== ParticipantHorizontal);
  }

  const handleResizeEnd = e => {
    const width = currentNode.measured.width;
    const height = currentNode.measured.height;
    const { width: startWidth, height: startHeight } = startSizeRef.current;

    if (startWidth !== width) {
      if (isHorizontalLane) {
        onWidthChange()
      } else {
        onWidthChangeVertical()
      }
    }

    if (startHeight !== height) {
      if (isHorizontalLane) {
        onHeightChange()
      } else {
        onHeightChangeVertical()
      }
    }
  }

  const onWidthChangeEffect = ({ width, oldx = 0, newx = 0 }) => {
    const isPositionChange = (newx - oldx) !== 0;
    laneNodes.forEach(laneNode => {
      reactflow.updateNode(laneNode.id, (node) => {
        node.width = width;
        // if (isPositionChange) {
        //   node.position.x = titleWidth;
        // }
        node.position.x = titleWidth;
      })
    })

    if (isPositionChange) {
      // 更新所有除子泳道的node的位置
      const intersectingNodes = reactflow.getIntersectingNodes({ id }, true).filter(node => node.type !== ParticipantLane && node.parentId === id);

      intersectingNodes.forEach(intersectingNode => {
        reactflow.updateNode(intersectingNode.id, (node) => {
          const x = node.position.x;
          const diff = newx - oldx;
          node.position.x = x - diff;
          // node.origin = [0, 0];
        })
      })
    }
  }

  const onHeightChangeEffect = ({ height, oldy = 0, newy = 0 }) => {
    const isPositionChange = (newy - oldy) !== 0;
    laneNodes.forEach(laneNode => {
      reactflow.updateNode(laneNode.id, (node) => {
        node.height = height;
        // if (isPositionChange) {
        //   node.position.y = titleWidth;
        // }
        node.position.y = titleWidth;
      })
    })
  
    if (isPositionChange) {
      // 更新所有除子泳道的node的位置
      const intersectingNodes = reactflow.getIntersectingNodes({ id }, true).filter(node => node.type !== ParticipantLane && node.parentId === id);
  
      intersectingNodes.forEach(intersectingNode => {
        reactflow.updateNode(intersectingNode.id, (node) => {
          const y = node.position.y;
          const diff = newy - oldy;
          node.position.y = y - diff;
          // node.origin = [0, 0];
        })
      })
    }
  }
  


  function onWidthChange() {
    const { isHorizontal, affectsLeft } = resizedirectionRef.current;
    const width = currentNode.measured.width;
    const { width: startWidth } = startSizeRef.current;

    const isLeftDirection = isHorizontal && affectsLeft;
    if (isLeftDirection) {
      const diffW = width - startWidth;

      if (diffW < 0) { // 缩小
        const intersectingNodes = intersectingNodesRef.current;
        const positionXArr = intersectingNodes.map(node => node.position.x);
        const minX = Math.min(...positionXArr);

        if ((currentNode.position.x + titleWidth) > minX) {
          reactflow.updateNode(id, node => {
            node.width = width + titleWidth;
            const currentx = node.position.x;
            const newx = currentx - titleWidth;
            node.position.x = newx;

            onWidthChangeEffect({ width, oldx: currentx, newx })
          })

          return;
        }
      }
      onWidthChangeEffect({ width: width - titleWidth })
    } else {
      onWidthChangeEffect({ width: width - titleWidth })
    }
  }

  function onHeightChange() {
    const { isVertical, affectsTop } = resizedirectionRef.current;
    const height = currentNode.measured.height;
    const { height: startHeight } = startSizeRef.current;

    const isTopDirection = isVertical && affectsTop;

    const diffH = height - startHeight;
    if (isTopDirection) {
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

  function onWidthChangeVertical() {
    const { isHorizontal, affectsLeft } = resizedirectionRef.current;
    const width = currentNode.measured.width;
    const { width: startWidth } = startSizeRef.current;

    const isLeftDirection = isHorizontal && affectsLeft;

    const diff = width - startWidth;
    if (isLeftDirection) {
      const needChangeNode = laneNodes[0];
      reactflow.updateNode(needChangeNode.id, node => {
        const width = node.width ?? node.measured.width;
        node.width = width + diff;
        node.position.x = 0;
      })
    } else {
      const needChangeNode = laneNodes[laneNodes.length - 1];
      reactflow.updateNode(needChangeNode.id, node => {
        const width = node.width ?? node.measured.width;
        node.width = width + diff;
      })
    }
  }

  function onHeightChangeVertical() {
  const { isVertical, affectsTop } = resizedirectionRef.current;
  const height = currentNode.measured.height;
  const { height: startHeight } = startSizeRef.current;

  const isTopDirection = isVertical && affectsTop;

  

  if (isTopDirection) {
    const diffH = height - startHeight;

    if (diffH < 0) { // 缩小
      const intersectingNodes = intersectingNodesRef.current;
      const positionYArr = intersectingNodes.map(node => node.position.y);
      const minY = Math.min(...positionYArr);

      if ((currentNode.position.y + titleWidth) > minY) {
        reactflow.updateNode(id, node => {
          node.height = height + titleWidth;
          const currenty = node.position.y;
          const newy = currenty - titleWidth;
          node.position.y = newy;

          onHeightChangeEffect({ height, oldy: currenty, newy })
        })

        return;
      }
    }
    onHeightChangeEffect({ height: height - titleWidth })
  } else {
    onHeightChangeEffect({ height: height - titleWidth })
  }
  }

  return {
    handleResizeStart,
    handleResizeEnd
  }
}