import {useEffect, useState, useCallback} from 'react';
import prettyBytes from 'pretty-bytes';
import { JsonViewer } from '@textea/json-viewer'

const stringData = [];
const bufferData = [];

const baseSize = 1024 * 1024 * 100;

let arr = [];
for (let i = 0; i < baseSize; i++) {
  arr[i] = 'a';
}
const s = arr.join('');
const baseStringSize = new Blob([s]).size;


function App() {
  const [stringMemory, setStringMemory] = useState(baseStringSize);
  const [bufferMemory, setBufferMemory] = useState(0);
  const [runningAddStrings, setRunningAddStrings] = useState(false);
  const [runningAddBuffers, setRunningAddBuffers] = useState(false);
  const [bufferMemoryLimitReached, setBufferMemoryLimitReached] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState(null);

  const measureMemory = useCallback(async () => {
    const memorySample = await performance.measureUserAgentSpecificMemory();
    setMemoryUsage(memorySample);
    setTimeout(measureMemory, 200);
  }, [setMemoryUsage]);

  useEffect(() => {
    measureMemory();
  }, [measureMemory]);

  useEffect(() => {
    if (!runningAddStrings && !runningAddBuffers) return;
    const interval = setInterval(() => {
      if (runningAddStrings) {
        stringData.push(s.toUpperCase());
        setStringMemory((stringData.length + 1) * baseStringSize);
      } else {
        try {
          const bytes = new Uint8Array(baseSize);
          bufferData.push(bytes);
          setBufferMemory(bufferData.length * baseSize);
        } catch (e) {
          setBufferMemoryLimitReached(true);
          setRunningAddBuffers(false);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [runningAddBuffers, runningAddStrings, measureMemory]);

  return (
    <div>
        <div>String memory usage: {prettyBytes(stringMemory)}</div>
        <div>Buffer memory usage: {prettyBytes(bufferMemory)}</div>
        <div>Memory usage from API: {prettyBytes(window.performance.memory.usedJSHeapSize)}</div>
        <div>Memory limit from API: {prettyBytes(window.performance.memory.jsHeapSizeLimit)}</div>
        {bufferMemoryLimitReached && <div>Buffer memory limit is about {prettyBytes(bufferMemory)}</div>}
        {memoryUsage && (<div>measureUserAgentSpecificMemory: <JsonViewer value={memoryUsage} /></div>)}
        <div>
          {<button onClick={() => setRunningAddStrings(!runningAddStrings)}>{runningAddStrings ? 'stop creating strings' : 'start creating strings'}</button>}
          <button onClick={() => setRunningAddBuffers(!runningAddBuffers)}>{runningAddBuffers ? 'stop creating byte arrays' : 'start creating byte arrays'}</button>
        </div>
    </div>
  );
}

export default App;
