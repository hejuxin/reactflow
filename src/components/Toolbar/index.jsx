import { Upload, Download } from "./components";
import "./index.less";

const Toolbar = () => {
  return (
    <div className="toolWrap">
      <Upload />
      <Download />
    </div>
  )
}

export default Toolbar;