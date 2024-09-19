import { getElements } from "@/service";
import { useReactFlow } from "@xyflow/react";
import convert from "xml-js";
import img from "@/assets/toolbar/open.svg";
import { useRef } from "react";

const Upload = () => {
  const reactflow = useReactFlow();
  const uploadBtn = useRef();
  const handleFileUpload = () => {
    uploadBtn.current?.click();
  };
  const handleFileChange = e => {
    console.log(e, "e");

    const file = e.target.files[0];
    console.log(file)

    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = function (e) {
      let xml = e.target.result

      // console.log(xml, "xml")

      const content = convert.xml2json(xml, { compact: false, spaces: 4 });
      console.log(content, "content")

      const { nodes, edges } = getElements(content);
      console.log(nodes, "nodes");

      reactflow.setNodes(nodes);
      reactflow.setEdges(edges);
    }
  }
  return (
    <div onClick={handleFileUpload}>
      <img src={img} alt="打开BPMN文件" title="打开BPMN文件" />
      <input type="file" onChange={handleFileChange} ref={uploadBtn} style={{ display: "none" }} />
    </div>
  )
}

export default Upload;