import { memo } from "react";
import { nodeTypesArr } from "@/nodes";
import "./index.css";

const allowedNodes = nodeTypesArr.map(item => {
  if (item.show ?? true) {
    return {
      name: item.name,
      type: item.type
    }
  }
}).filter(Boolean)

const Slider = () => {
  const onDragStart = (evt, nodeType) => {
    console.log(evt, "evt");
    // 记录被拖拽的节点类型
    evt.dataTransfer.setData("application/reactflow", nodeType);
    evt.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="sliderWrap">
      {allowedNodes.map((x, i) => (
        <div
          key={`${x.type}-${i}`}
          className="slideritem"
          onDragStart={(e) => onDragStart(e, x.type)}
          draggable
        >
          {x.name}
        </div>
      ))}
    </div>
  );
};

export default memo(Slider);
