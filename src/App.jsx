import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Graph, Slider, Toolbar } from './components';
import './App.css';

export default function App() {
  return (
    <div className='container'>
      <Toolbar />
      <Slider />
      <Graph />
    </div>
  );
}