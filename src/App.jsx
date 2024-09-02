import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Graph, Slider } from './components';
import './App.css';

export default function App() {
  return (
    <div className='container'>
      <Slider />
      <Graph />
    </div>
  );
}