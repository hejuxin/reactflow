import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import { NodeResizer, NodeToolbar, useNodes, useReactFlow } from '@xyflow/react';
import cn from 'classnames';
import { createLane, laneDefalutHeight, laneMinHeight, laneMinWidth, deleteLane, getLaneNodes, handleAddLaneHorizontal, ParticipantHorizontal, handleAddLaneVertical } from './utils';
import { useResize } from './useResize'
import Toolbar from './components/Toolbar';
import './index.less';

const LaneNode = (props) => {
  const { selected: pselected = false, id, parentId } = props;
  const [selected, setSelected] = useState(false);

  const reactflow = useReactFlow();
  const nodes = useNodes();
  const currentNode = reactflow.getNode(id);
  const parentNode = reactflow.getNode(parentId);
  const isHorizontal = parentNode.type === ParticipantHorizontal;
  const laneNodes = getLaneNodes({ nodes, parentId });
  const currentIndexInLaneNodes = laneNodes.findIndex(node => node.id === id);
  const isFirstNode = id === laneNodes[0].id;

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);

  useEffect(() => {
    if (pselected && laneNodes.length !== 1) {
      setSelected(true);
      return;
    }
    setSelected(false);
  }, [pselected, laneNodes])

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
        color="#0095ff"
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
      <Toolbar id={id} parentId={parentId} isHorizontal={isHorizontal} />
      {props.data?.label}
    </div>
  )
}

export default memo(LaneNode);