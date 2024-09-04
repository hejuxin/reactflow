import { memo } from "react";
import './index.css';

const allowedNodes = [
  {
    name: 'Input Node',
    type: 'input',
  },
  {
    name: 'SelectToolbarNode Node',
    type: 'selecttools', // 这是自定义节点类型
  },
  {
    name: 'Output Node',
    type: 'output',
  },
  {
    name: 'Group',
    type: 'group'
  },
  {
    name: 'Swim',
    type: 'swimming'
  }
]

const Slider = () => {
  const onDragStart = (evt, nodeType) => {
    console.log(evt, 'evt')
    // 记录被拖拽的节点类型
    evt.dataTransfer.setData('application/reactflow', nodeType);
    evt.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sliderWrap">
      {allowedNodes.map((x, i) => (
        <div
          key={`${x.type}-${i}`}
          className="slideritem"
          onDragStart={e => onDragStart(e, x.type)}
          draggable
        >
          {x.name}
        </div>
      ))}
    </div>
  );
}

export default memo(Slider);