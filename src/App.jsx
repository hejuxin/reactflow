import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Graph } from './features';
import './App.css';
import { ReactFlowProvider } from '@xyflow/react';

export default function App() {
  return (
    <div className='container'>
      {/* <Toolbar />
      <Slider /> */}
      <ReactFlowProvider>
        <Graph />
      </ReactFlowProvider>
    </div>
  );
}