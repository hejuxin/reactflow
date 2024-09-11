import convert from 'xml-js';
import fs from 'fs';
import path from 'path';

import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import ncp from 'copy-paste';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const url = path.resolve(__dirname, './diagram.bpmn');

const xml = fs.readFileSync(url);

const result2 = convert.xml2json(xml, {compact: false, spaces: 4});


ncp.copy(result2)

