import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { laneMinHeight, laneMinWidth } from './utils';
import { useResize } from './useResize'
import './index.less';

const LaneNode = (props) => {
  const { selected = false, id, parentId } = props;

  const reactflow = useReactFlow();
  const nodes = useNodes();
  const laneNodes = nodes.filter(node => node.id.startsWith(parentId) && node.id !== parentId);
  const isFirstNode = id === laneNodes[0].id;

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);

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
        shouldResize={shouldResize}
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        {...resizerprops}
      />
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);