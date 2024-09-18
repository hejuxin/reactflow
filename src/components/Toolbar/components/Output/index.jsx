import { useReactFlow } from "@xyflow/react"
import { Button } from "antd";
import { memo } from "react"

const Output = props => {
  const reactflow = useReactFlow();
  const handleOutput = () => {
    console.log(reactflow.toObject());
  }
  return (
    <Button onClick={handleOutput}>output</Button>
  )
}

export default memo(Output)