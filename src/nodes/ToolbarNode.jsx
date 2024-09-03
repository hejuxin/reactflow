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
  console.log(props, 'dd')
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
              {/* <div className='sources'>
                <Handle type="source" position={Position.Top} />
                <Handle type="source" position={Position.Left} />
                <Handle type="source" position={Position.Right} />
                <Handle type="source" position={Position.Bottom} />
              </div> */}
              <Handle type="target" position={Position.Left} />
              <Handle type="source" position={Position.Right} />
              <div
                style={{
                  //   position: 'absolute',
                  color: '#555555',
                  bottom: -15,
                  fontSize: 8,
                }}
              >
                {
                  isEdit ? <Input defaultValue={data.label} /> : data.label
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