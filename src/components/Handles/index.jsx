import { memo, Fragment } from "react";
import { Position, Handle } from "@xyflow/react";

const Handles = (props) => {
  const { id } = props;
  return (
    <>
      {
        Object.keys(Position).map(key => {
          const value = Position[key];
          return (
            <Fragment key={`${id}-handle-${value}`}>
              <Handle type="source" id={`${id}-source-${value}`} position={value} />
              <Handle type="target" id={`${id}-target-${value}`} position={value} />
            </Fragment>
          )
        })
      }
    </>
  )
}

export default memo(Handles);