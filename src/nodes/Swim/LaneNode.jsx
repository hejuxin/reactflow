import React, { memo, useRef, useEffect } from 'react';
import { NodeResizer, useNodes, useReactFlow } from '@xyflow/react';
import { laneHeight, laneMinHeight, titleWidth } from '../../utils/swim';
import { useState } from 'react';
import { useMemo } from 'react';

const LaneNode = (props) => {
  const { selected = false, id, parentId } = props;
  const [maxHeight, setMaxHeight] = useState();

  const reactflow = useReactFlow();
  const nodes = useNodes();
  const startSize = useRef(null);
  const needChangeNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== id);
  // const handleResize = e => {
  //   console.log(e, 'handleResize')
  // }
  const handleResizeEnd = e => {
    console.log(e, 'handleResizeEnd')
    const node = nodes.find(node => node.id === id);

    const { width, height } = node.measured;
    const { width: startWidth, height: startHeight } = startSize.current;

    if (startWidth < width) {
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

    if (startHeight !== height) {
      const isTop = e.sourceEvent.target.className.includes('top');
      const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
      const diffH = height - startHeight;
      // 第一个子节点，且拖拽的是上边框
      if (id === laneNodes[0].id && isTop) {
        console.log(diffH)
        reactflow.updateNode(parentId, (node) => {
          node.height = node.measured.height + diffH;
          const position = node.position;
          console.log(position, 'parentId')
          node.position = {
            ...position,
            y: position.y - diffH
          }
          return { ...node }
        })

        laneNodes.forEach(node => {
          reactflow.updateNode(node.id, (node) => {
            const position = node.position;
            console.log(position, 'laneNodes')
            node.position = {
              ...position,
              y: position.y + diffH
            }
            return { ...node }
          })
        })
      }

      // 最后一个子节点，且拖拽的是下边框
      if (id === laneNodes[laneNodes.length - 1].id && !isTop) {
        reactflow.updateNode(parentId, (node) => {
          node.height = node.measured.height + diffH;
          return { ...node }
        })
      }
      const index = nodes.findIndex(node => node.id === id);

      reactflow.updateNode(id, (node) => {
        // node.extent = '';
        const _node = { ...node };
        _node.extent = 'parent';
        return _node
      }, { replace: true })

      if (isTop) {

        const needChangeNode = nodes[index - 1];
        console.log(needChangeNode, 'isTop')
        reactflow.updateNode(needChangeNode.id, (node) => {
          const currentHeight = node.height ?? node.style.height;
          console.log(currentHeight, diffH)
          node.height = currentHeight - diffH;
          return { ...node }
        })
      } else {
        const needChangeNode = nodes[index + 1];
        reactflow.updateNode(needChangeNode.id, (node) => {
          const currentHeight = node.height ?? node.style.height;
          node.height = currentHeight - diffH;
          const position = node.position;
          node.position = {
            ...position,
            y: position.y + diffH
          }
          return { ...node }
        })
      }
    }


    // if (startHeight < height) {
    //   reactflow.updateNode(parentId, (node) => {
    //     node.height = node.height - startHeight + height
    //     return { ...node }
    //   })
    // } else {
    //   console.log('height change')
    //   reactflow.updateNode(parentId, (node) => {
    //     console.log(node.height, )
    //     node.height = node.height - startHeight + height
    //     return { ...node }
    //   })
    // }
  }

  const handleResizeStart = e => {
    startSize.current = {
      width: props.width,
      height: props.height
    }

    const isTop = e.sourceEvent.target.className.includes('top');
    const _id = e.sourceEvent.target.parentNode.dataset;
    console.log(e, e.sourceEvent)
    console.log(nodes, 'nodes')
    // console.log(_id, '+od', _id.id, _id.get(id))
    const index = nodes.findIndex(node => node.id === id);
    const node = nodes.find(node => node.id === id);
    if (isTop) {

      const needChangeNode = nodes[index - 1];
      console.log(needChangeNode, 'isTop')
      const diffH = needChangeNode.height ?? needChangeNode.measured.height - laneMinHeight;
      console.log(diffH, 'diffH')
      const currentNodeMaxHeight = node.height ?? node.measured.height + diffH;
      console.log(currentNodeMaxHeight, 'currentNodeMaxHeight')
      setMaxHeight(currentNodeMaxHeight)
    } else {
      const needChangeNode = nodes[index + 1];
      console.log(needChangeNode, 'not isTop')
      const diffH = needChangeNode.height ?? needChangeNode.measured.height - laneMinHeight;
      console.log(diffH, 'diffH')
      const currentNodeMaxHeight = node.height ?? node.measured.height + diffH;
      console.log(currentNodeMaxHeight, 'currentNodeMaxHeight')
      setMaxHeight(currentNodeMaxHeight)
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
    <div style={{ border: '1px solid blue', height: '100%', width: '100%' }}>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={laneMinHeight}
        // maxHeight={100}
        // onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        {...resizerprops}
      />
      {props.data.label}
    </div>
  )
}

export default memo(LaneNode);