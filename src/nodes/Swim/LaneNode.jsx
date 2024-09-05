import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { laneHeight, laneMinHeight, titleWidth, laneMinWidth } from '@/utils/swim';
import './index.less';

const getHeight = node => {
  return node.height ?? node.measured.height;
}

const LaneNode = (props) => {
  const { selected = false, id, parentId } = props;
  const [maxHeight, setMaxHeight] = useState();

  const reactflow = useReactFlow();
  const nodes = useNodes();
  const startSize = useRef(null);
  const needChangeNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== id);
  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const isFirstNode = id === laneNodes[0].id;
  const isLastNode = id === laneNodes[laneNodes.length - 1].id;

  const isTopRef = useRef();
  const isLeftRef = useRef();
  
  const handleResizeEnd = e => {
    const node = nodes.find(node => node.id === id);

    const width = node.width ?? node.measured.width;
    const height = getHeight(node);
    const { width: startWidth, height: startHeight } = startSize.current;

    if (startWidth !== width) {
      if (isLeftRef.current) {
        const diffW = width - startWidth;
        // 左侧拖拽缩放时，需更改父级的x定位
        // 对于所有子泳道，需修改重新x定位。包括自身

        needChangeNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
            const x = node.position.x;
            if (node.id === parentId) {
              node.width = width + titleWidth;
              node.position.x = x - diffW;
            } else {
              node.width = width;
              node.position.x = titleWidth;
            }
            return { ...node }
          })
        })

        reactflow.updateNode(id, node => {
          node.position.x = titleWidth;
          return { ...node }
        })

      } else {
        needChangeNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
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
      // const isTop = e.sourceEvent.target.className.includes('top');
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

        laneNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
            const y = node.position.y;
            node.position.y = y + diffH;
            return { ...node }
          })
        })

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
      const index = nodes.findIndex(node => node.id === id);

      reactflow.updateNode(id, (node) => {
        const _node = { ...node };
        _node.extent = 'parent';
        return _node
      }, { replace: true })

      if (isTopRef.current) {
        const needChangeNode = nodes[index - 1];
        reactflow.updateNode(needChangeNode.id, (node) => {
          const currentHeight = getHeight(node);
          node.height = currentHeight - diffH;
          return { ...node }
        })
        return;
      } else {
        const needChangeNode = nodes[index + 1];
        reactflow.updateNode(needChangeNode.id, (node) => {
          const currentHeight = getHeight(node);
          node.height = currentHeight - diffH;
          
          const y = node.position.y;
          node.position.y = y + diffH;
          return { ...node }
        })
      }
    }
  }

  const handleResizeStart = e => {
    startSize.current = {
      width: props.width,
      height: props.height
    }

    const isTop = e.sourceEvent.target.className.includes('top');
    isTopRef.current = isTop;
    const isLeft = e.sourceEvent.target.className.includes('left');
    isLeftRef.current = isLeft;
    const index = nodes.findIndex(node => node.id === id);
    const node = nodes.find(node => node.id === id);

    if (isTop) {
      if (isFirstNode) return;
      const needChangeNode = nodes[index - 1];
      const diffH = getHeight(needChangeNode) - laneMinHeight;
      const currentNodeMaxHeight = getHeight(node) + diffH;
      setMaxHeight(() => currentNodeMaxHeight)
    } else {
      if (isLastNode) return;
      const needChangeNode = nodes[index + 1];
      const diffH = getHeight(needChangeNode) - laneMinHeight;
      const currentNodeMaxHeight = getHeight(node) + diffH;
      setMaxHeight(() => currentNodeMaxHeight)
    }
  }

  useEffect(() => {
    if (selected) {
      reactflow.updateNode(id, (node) => {
        // node.extent = '';
        const _node = { ...node };
        delete _node.extent;
        return _node
      }, { replace: true })
    }
  }, [selected])

  const resizerprops = useMemo(() => {
    const newProps = {};

    if (maxHeight) {
      newProps.maxHeight = maxHeight
    } else {
      delete newProps.maxHeight
    }

    return newProps

  }, [maxHeight]);

  return (
    <div className={cn('laneWrap', { 'noTopborder': isFirstNode })}>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={laneMinWidth}
        minHeight={laneMinHeight}
        // maxHeight={100}
        // onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        {...resizerprops}
      />
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);