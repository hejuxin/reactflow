export const maingraphId = "main"
export let graphId = maingraphId;

export function setId(id) {
  if (graphId === id) return;
  graphId = id;
};


export const graphDataMap = new Map([]);