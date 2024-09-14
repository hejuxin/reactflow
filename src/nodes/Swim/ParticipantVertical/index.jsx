import React, { memo, useRef } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';
import { titleWidth, ParticipantVerticalLaneSize } from '../utils';
import { useResizeWrap } from '../useResize';
import '../index.less';
import Toolbar from '../components/Toolbar';

const ParticipantVertical = (props) => {
  const { selected = false, data, id } = props;

  const { handleResizeStart, handleResizeEnd } = useResizeWrap(id);

  return (
    <>
      <NodeResizer
        color="#0095ff"
        isVisible={selected}
        minWidth={ParticipantVerticalLaneSize.minWidth}
        minHeight={ParticipantVerticalLaneSize.minHeight + titleWidth}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />
      <Toolbar id={id} isLane={false} />
      <div className='swinWrap vertical'>
        <div className='title' style={{ height: titleWidth }}>
          <div>title</div>
        </div>
      </div>
    </>
  )
}

export default memo(ParticipantVertical);