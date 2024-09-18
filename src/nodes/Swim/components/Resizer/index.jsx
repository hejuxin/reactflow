import { memo } from "react";
import { NodeResizeControl } from "@xyflow/react";
import './index.less';

const Resizer = props => {
  const handles = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

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