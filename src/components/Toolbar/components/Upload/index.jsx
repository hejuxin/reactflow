import { getData } from '@/service';
import convert from 'xml-js';

const Upload = () => {
  const handleFileUpload = e => {
    console.log(e, 'e');

    const file = e.target.files[0];
    console.log(file)

    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');
    reader.onload = function (e) {
      let xml = e.target.result

      // console.log(xml, 'xml')

      const content = convert.xml2json(xml, { compact: false, spaces: 4 });
      console.log(content, 'content')

      const nodes = getData(content);
      console.log(nodes, 'nodes');
    }
  }
  return (
    <input type="file" onChange={handleFileUpload} />
  )
}

export default Upload;