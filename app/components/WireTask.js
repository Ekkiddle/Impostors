'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { shuffleArray } from '../game/gameManager';
import DraggableWire from './DraggableWire';
import WireTarget from './WireTarget';


export default function WireTask() {
  const [connections, setConnections] = useState([]);
  const [hoverBlue, setHoveringBlue] = useState(false);
  const [hoverRed, setHoveringRed] = useState(false);
  const [hoverYellow, setHoveringYellow] = useState(false);
  const [hoverGreen, setHoveringGreen] = useState(false);

  const [sources, setSources] = useState(null);
  const [ends, setEnds] = useState(null);
  
  const blueRef = useRef(null);
  const redRef = useRef(null);
  const yellowRef = useRef(null);
  const greenRef = useRef(null);

  const startWires = [
    <DraggableWire 
        color="blue"
        targetRef={blueRef}
        onConnection={() => {setConnections(connections.push('blue')); setHoveringBlue(false)}}
        onHover={() => setHoveringBlue(true)}
    />,
    <DraggableWire 
        color="red"
        targetRef={redRef}
        onConnection={() => {setConnections(connections.push('red')); setHoveringRed(false)}}
        onHover={() => setHoveringRed(true)}
    />,
    <DraggableWire 
        color="yellow"
        targetRef={yellowRef}
        onConnection={() => {setConnections(connections.push('yellow')); setHoveringYellow(false)}}
        onHover={() => setHoveringYellow(true)}
    />,
    <DraggableWire 
        color="green"
        targetRef={greenRef}
        onConnection={() => {setConnections(connections.push('green')); setHoveringGreen(false)}}
        onHover={() => setHoveringGreen(true)}
    />,
  ]

  const endWires = [
    <WireTarget
        color='blue'
        ref={blueRef}
        isHovering={hoverBlue}
    />,
    <WireTarget
        color='red'
        ref={redRef}
        isHovering={hoverRed}
    />,
    <WireTarget
        color='yellow'
        ref={yellowRef}
        isHovering={hoverYellow}
    />,
    <WireTarget
        color='green'
        ref={greenRef}
        isHovering={hoverGreen}
    />,
  ]

  useEffect(()=>{
    setSources(shuffleArray(startWires));
    setEnds(shuffleArray(endWires));
  }, [setSources, setEnds])


  return (
    <div className="grid grid-cols-2 gap-x-40 gap-y-4 relative w-screen h-64 bg-red-100">
        {sources?.map((StartWire, index) => (
            <>
            {/* Start wire in column 1 */}
            <div key={`start-${index}`} className="col-start-1">{StartWire}</div>

            {/* Matching End wire in column 2 */}
            <div key={`end-${index}`} className="col-start-2">{ends[index]}</div>
            </>
        ))}
    </div>
  );
};
