import React, { memo, useState, useEffect } from "react";
import { NodeResizer } from "@xyflow/react";
import GroupNode from "../GroupNode";
import { nodeUrl } from "@constants/nodeUrl";
import { Input } from "antd";

const ImageNode = (props) => {
  const [isEdit, setIsEdit] = useState(false);

  const { data, selected = false, nodeType } = props;
  useEffect(() => {
    if (!selected) {
      setIsEdit(false);
    }
  }, [selected]);
  return (
    <>
      <div
        className="nodeWrap"
        onDoubleClick={() => setIsEdit(true)}
        onBlur={() => console.log("blur")}
      >
        <NodeResizer
          // color="#ff0071"
          isVisible={selected}
          minWidth={56}
          minHeight={56}
        />
        <GroupNode>
          <div>
            <img src={nodeUrl[nodeType]} alt="" />
          </div>
          <div
            style={{
              //   position: 'absolute',
              color: "#555555",
              bottom: -15,
              fontSize: 8,
            }}
          >
            {isEdit ? (
              <Input defaultValue={data.label} className="nodrag" />
            ) : (
              data?.label
            )}
          </div>
        </GroupNode>
        |
      </div>
    </>
  );
};

export default memo(ImageNode);
