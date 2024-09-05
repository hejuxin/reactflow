import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import {
  EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FlowContext } from '../context';
import './index.css';


function ToolbarNode(props) {
  const [isEdit, setIsEdit] = useState(false);
  const { data, id, selected } = props;
  useEffect(() => {
    if (!selected) {
      setIsEdit(false);
    }
  }, [selected])
  return (
    <FlowContext.Consumer>
      {
        (value) => {
          // console.log(value, 'value');
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
              <Handle type="source" id="source-1" position={Position.Top} />
              <Handle type="source" id="source-2" position={Position.Left} />
              <Handle type="source" id="source-3" position={Position.Right} />
              <Handle type="source" id="source-4" position={Position.Bottom} />

              <Handle type="target" id="target-1" position={Position.Top} />
              <Handle type="target" id="target-2" position={Position.Left} />
              <Handle type="target" id="target-3" position={Position.Right} />
              <Handle type="target" id="target-4" position={Position.Bottom} />
              <div
                style={{
                  //   position: 'absolute',
                  color: '#555555',
                  bottom: -15,
                  fontSize: 8,
                }}
              >
                {
                  isEdit ? <Input defaultValue={data.label} className='nodrag'/> : data.label
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