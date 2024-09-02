import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import {
  EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import { FlowContext } from './context';

function ToolbarNode(props) {
  console.log(props, 'data')
  const { data, id } = props;
  return (
    <FlowContext.Consumer>
      {
        (value) => {
          // console.log(value, 'value');
          const { handleEdit,  handleDel} = value;
          return (
            <>
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
              <Handle type="target" position={Position.Left} />
              <Handle type="source" position={Position.Right} />

              <div
                style={{
                  //   position: 'absolute',
                  color: '#555555',
                  bottom: -15,
                  fontSize: 8,
                }}
              >{data.label}</div>
            </>
          )
        }
      }
    </FlowContext.Consumer>
  )
}

export default memo(ToolbarNode);