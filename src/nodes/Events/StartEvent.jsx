import React, { memo } from "react";
import ImageNode from "../components/ImageNode";

const GatewayNode = (props) => {
  const { selected = false } = props;
  return (
    <>
      <ImageNode selected={selected} nodeType="start-event"></ImageNode>
    </>
  );
};

export default memo(GatewayNode);
