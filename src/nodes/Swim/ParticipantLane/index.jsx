import React, { memo, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ParticipantHorizontalLaneSize, ParticipantVerticalLaneSize, getIsHorizontal } from '../utils';
import { useResize } from '../useResize'
import { Toolbar, Resizer } from '../components';
import '../index.less';

const ParticipantLane = (props) => {
  const { selected = false, id, parentId } = props;

  const reactflow = useReactFlow();

  const isHorizontal = getIsHorizontal({ parentId, reactflow });

  const { handleResizeStart, handleResize, handleResizeEnd, shouldResize, maxHeight } = useResize(id, parentId);


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
    <div className='laneWrap'>
      <Resizer
        color="#0095ff"
        isVisible={selected}
        minWidth={isHorizontal ? ParticipantHorizontalLaneSize.minWidth : ParticipantVerticalLaneSize.minWidth}
        minHeight={isHorizontal ? ParticipantHorizontalLaneSize.minHeight : ParticipantVerticalLaneSize.minHeight}
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

export default memo(ParticipantLane);