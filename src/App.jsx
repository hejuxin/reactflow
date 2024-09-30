import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Graph, Toolbar, Slider } from './features';
import './App.css';
import { ReactFlowProvider } from '@xyflow/react';

export default function App() {
  return (
    <div className='container'>
      {/* <Toolbar />
      <Slider /> */}
      <ReactFlowProvider>
        <Toolbar />
        <Slider />
        <Graph />
      </ReactFlowProvider>
    </div>
  );
}