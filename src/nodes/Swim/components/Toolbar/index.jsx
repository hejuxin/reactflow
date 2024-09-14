import { NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { Button } from "antd";
import { useMemo } from "react";
import { handleAddLaneHorizontal, handleAddLaneVertical } from "../../utils";

const Toolbar = (props) => {
  const { isHorizontal = false, id, isLane = true, ...others } = props;
  const reactflow = useReactFlow();

  const handleAddFn = useMemo(() => {
    return isHorizontal ? handleAddLaneHorizontal(isLane) : handleAddLaneVertical(isLane);
  }, [isHorizontal])
  const handleAdd = (direction) => handleAddFn({ direction, reactflow, id, ...others });

  const handleDel = () => {
    reactflow.deleteElements({
      nodes: [{ id }]
    });
  }

  return (
    <NodeToolbar
      position={Position.Right}
      style={{ background: '#fff' }}
    >

      {
        isHorizontal ? (
          <>
            <Button type='link' onClick={() => handleAdd(Position.Top)}>{Position.Top}</Button>
            <Button type='link' onClick={() => handleAdd(Position.Bottom)}>{Position.Bottom}</Button>
          </>
        ) : (
          <>
            <Button type='link' onClick={() => handleAdd(Position.Left)}>{Position.Left}</Button>
            <Button type='link' onClick={() => handleAdd(Position.Right)}>{Position.Right}</Button>
          </>
        )
      }

      <Button type='link' onClick={handleDel}>删除</Button>
    </NodeToolbar>
  )
}

export default Toolbar;