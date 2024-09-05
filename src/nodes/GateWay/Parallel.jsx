import React, { memo } from "react";
import ImageNode from "../components/ImageNode";

const GatewayNode = (props) => {
  const { selected = false, data } = props;
  return (
    <>
      <ImageNode
        data={data}
        selected={selected}
        nodeType="parallel-gateway"
      ></ImageNode>
    </>
  );
};

export default memo(GatewayNode);
