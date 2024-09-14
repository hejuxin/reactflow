import React, { memo, useRef } from 'react';
import { NodeResizer, NodeToolbar, useNodeId, useNodes, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Button } from 'antd';
import { createLane, titleWidth, handleAddLaneHorizontal, ParticipantHorizontalLaneSize } from '../utils';
import { useResizeWrap } from '../useResize';
import '../index.less';
import { Toolbar, Resizer } from '../components';

const ParticipantHorizontal = (props) => {
  const { selected = false, data, id } = props;

  const { handleResizeStart, handleResizeEnd } = useResizeWrap(id);

  return (
    <>
      <Resizer
        color="#0095ff"
        isVisible={selected}
        minWidth={ParticipantHorizontalLaneSize.minWidth + titleWidth}
        // todo
        // minHeight={wrapHeight / 2}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />
      <Toolbar id={id}  isLane={false} isHorizontal />
      <div className='swinWrap horizontal'>
        <div className='title' style={{ width: titleWidth }}>
          <div>title</div>
        </div>
      </div>
    </>
  )
}

export default memo(ParticipantHorizontal);