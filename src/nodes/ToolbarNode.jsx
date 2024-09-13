import React, { memo, useEffect, useState, useRef } from 'react';
import { Handle, Position, NodeToolbar, useReactFlow } from '@xyflow/react';
import {
  EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FlowContext } from '../context';
import './index.less';
import Handles from '@/components/Handles';

function ToolbarNode(props) {
  const [isEdit, setIsEdit] = useState(false);
  const { data, id, selected } = props;
  const [inputValue, setinputValue] = useState(data?.label ?? '');

  const reactflow = useReactFlow();
  useEffect(() => {
    if (!selected) {
      setIsEdit(false);
    }
  }, [selected])

  const handleBlur = e => {
    console.log(inputValue);
    reactflow.updateNodeData(id, {
      label: inputValue
    })
  }

  const handleChange = e => {
    const value = e.target.value;
    setinputValue(value);
  }

  return (
    <FlowContext.Consumer>
      {
        (value) => {
          const { handleEdit, handleDel } = value;
          return (
            <div className='nodeWrap' onDoubleClick={() => setIsEdit(true)} onBlur={() => console.log('blur')}>
              <NodeToolbar
                // isVisible={data.forceToolbarVisible || undefined}
                position={Position.Right}
                style={{ background: '#fff' }}
              >
                <Button type='link' onClick={() => handleEdit(props)}><EditOutlined /></Button>
                <Button type='link' onClick={() => handleDel(props)}><DeleteOutlined /></Button>
              </NodeToolbar>
              <div style={{ padding: '10px 20px' }}>
                <div>🚀</div>
              </div>

              <Handles id={id} />
              <div
                style={{
                  //   position: 'absolute',
                  color: '#555555',
                  bottom: -15,
                  fontSize: 8,
                }}
              >
                {
                  isEdit ? <Input value={inputValue} className='nodrag input' onChange={handleChange} onBlur={handleBlur} /> : data.label
                }
              </div>
            </div>
          )
        }
      }
    </FlowContext.Consumer>
  )
}

export default memo(ToolbarNode);