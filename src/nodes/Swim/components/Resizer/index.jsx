import { memo } from "react";
import { NodeResizeControl } from "@xyflow/react";
import { XY_RESIZER_LINE_POSITIONS, XY_RESIZER_HANDLE_POSITIONS } from "@xyflow/system";
import './index.less';

const Resizer = props => {
  const handles = [...XY_RESIZER_LINE_POSITIONS, ...XY_RESIZER_HANDLE_POSITIONS];

  if (!props.isVisible) return null;
  
  return (
    <div className="resizewrap">
      {handles.map((position) => (
        <NodeResizeControl
          key={position}
          position={position}
          {...props}
        />
      ))}
    </div>
  )
}

export default memo(Resizer);