import Handles from "@/components/Handles";
import { FlowContext } from "@/context";
import { useContext } from "react";
import { memo } from "react";

const SubProcess = props => {
  const { id } = props;
  const { onSubProcessExpand } = useContext(FlowContext);

  return (
    <div style={{ position: "relative" }}>
      <Handles />
      <div>SubProcess</div>
      <button style={{ position: "absolute" }} onClick={() => onSubProcessExpand(id)}>展开</button>
    </div>
  );
}

export default memo(SubProcess);