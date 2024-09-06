import { MarkerType } from "@xyflow/react";

export const edges = [
  // { id: 'e1-2', source: '1', target: '2' },
  {
    id: 'e1-2',
    source: '1-1',
    target: '1-2',
    label: 'edge',
    type: 'smoothstep',
    markerEnd: {
        type: MarkerType.ArrowClosed,
    },
},
{
    id: 'e1-3',
    source: '1-1',
    target: '1-3',
    // animated: true,
    label: 'animated edge',
    type: 'smoothstep',
},
]