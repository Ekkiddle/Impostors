'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { shuffleArray } from '../../game/gameManager';
import DraggableWire from '../DraggableWire';
import WireTarget from '../WireTarget';
import { darkenColor } from '../SpaceManIcon';


export default function WireTask({onSuccess}) {
  const [connections, setConnections] = useState([]);
  const [hoverBlue, setHoveringBlue] = useState(false);
  const [hoverRed, setHoveringRed] = useState(false);
  const [hoverYellow, setHoveringYellow] = useState(false);
  const [hoverpurple, setHoveringpurple] = useState(false);

  const [sources, setSources] = useState(null);
  const [ends, setEnds] = useState(null);
  
  const blueRef = useRef(null);
  const redRef = useRef(null);
  const yellowRef = useRef(null);
  const purpleRef = useRef(null);

  const size = 20;

  const isConnected = (color) => {
    const arr = Array.isArray(connections)
    const con = connections.includes(color)
    return ( arr && con);
  }

  const checkSuccess = useCallback(() => {
    if (connections.length === 4) {
      console.log("Success");
      if (onSuccess) onSuccess();
    }
  }, [connections]);

  useEffect(() => {
    checkSuccess();
  }, [connections, checkSuccess]);
  
  

  const startWires = [
    <DraggableWire 
        key='blue'
        size={size}
        color="#0000ff"
        targetRef={blueRef}
        onConnection={() => {setConnections(prev => [...prev, '#0000ff']) 
            setHoveringBlue(false);
        }}
        onHover={() => setHoveringBlue(true)}
    />,
    <DraggableWire 
        key='red'
        size={size}
        color="#ff0000"
        targetRef={redRef}
        onConnection={() => {setConnections(prev => [...prev, '#ff0000']);
            setHoveringRed(false)
        }}
        onHover={() => setHoveringRed(true)}
    />,
    <DraggableWire 
        key='yellow'
        size={size}
        color="#ffeb04"
        targetRef={yellowRef}
        onConnection={() => {setConnections(prev => [...prev, '#ffeb04']); 
            setHoveringYellow(false) 
        }}
        onHover={() => setHoveringYellow(true)}
    />,
    <DraggableWire 
        key='purple'
        size={size}
        color="#ff00ff"
        targetRef={purpleRef}
        onConnection={() => {setConnections(prev => [...prev, '#ff00ff']);
            setHoveringpurple(false)
        }}
        onHover={() => setHoveringpurple(true)}
    />,
  ]

  const endWires = [
    <WireTarget
        key='blue-target'
        size={size}
        color='#0000ff'
        ref={blueRef}
        isHovering={hoverBlue}
    />,
    <WireTarget
        key='red-target'
        size={size}
        color='#ff0000'
        ref={redRef}
        isHovering={hoverRed}
    />,
    <WireTarget
        key='yellow-target'
        size={size}
        color='#ffeb04'
        ref={yellowRef}
        isHovering={hoverYellow}
    />,
    <WireTarget
        key='purple-target'
        size={size}
        color='#ff00ff'
        ref={purpleRef}
        isHovering={hoverpurple}
    />,
  ]

  useEffect(()=>{
    setSources(shuffleArray(startWires));
    setEnds(shuffleArray(endWires));
  }, [setSources, setEnds])


  return (
    <div className="flex flex-col relative w-full h-full bg-black">
        <div
            className="absolute inset-0 z-0"
            style={{
            backgroundImage: 'url("/wiringbg.jpg")',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            }}
        />
        {sources?.map((StartWire, index) => (
            <div className='flex flex-row justify-between w-full h-[105%]' key={index}>
                <div className="flex flex-col h-full">
                    <div className='bg-gray-600 h-full w-16 max-w-[15vw] border-2 border-black z-5'></div>
                    <div className='bg-yellow-300 h-5  w-14 max-w-[13vw] border-2 border-black z-5'></div>
                    <div className='flex flex-row w-full'
                        style={{height: StartWire.props.size}}
                    >
                        <div className='relative w-12 max-w-[11vw] border-2 border-black z-5'
                            style={{backgroundColor: StartWire.props.color,
                                height: StartWire.props.size
                            }}
                        >
                            <div
                                className="absolute w-full z-7"
                                style={{
                                top: '-4%',        
                                left: 1,
                                height: '110%',      
                                backgroundColor: darkenColor(StartWire.props.color),
                                pointerEvents: 'none', 
                                }}
                            />
                            <div
                                className="absolute w-full z-7"
                                style={{
                                top: '24%',        // push it down by 1/4 of the original height
                                left: 1,
                                height: '50%',      // half the height
                                backgroundColor: StartWire.props.color,
                                pointerEvents: 'none', // so it doesn't block mouse events
                                }}
                            />
                        </div>
                        {StartWire}
                    </div>
                </div>
                <div className='flex flex-col items-end h-full'>
                    <div className='bg-gray-600 h-full w-16 max-w-[15vw] border-2 border-black z-5'></div>
                    <div className={`h-5 w-14 max-w-[13vw] border-2 border-black z-5 ${isConnected(ends[index].props.color) ? 'bg-yellow-300' : 'bg-gray-800'} `}>
                    </div>
                    <div className='flex flex-row w-full bg-black'
                        style={{height: ends[index].props.size}}
                    >
                        {ends[index]}
                        <div className='relative w-12 max-w-[11vw] border-2 border-black z-5'
                            style={{backgroundColor: ends[index].props.color,
                                size: ends[index].props.size
                            }}
                        >
                            <div
                                className="absolute w-full z-7"
                                style={{
                                top: '-4%',        
                                left: 1,
                                height: '110%',      
                                backgroundColor: darkenColor(ends[index].props.color),
                                pointerEvents: 'none', 
                                }}
                            />
                            <div
                                className="absolute w-full z-7"
                                style={{
                                top: '23%',         // push it down by 1/4 of the original height
                                left: 1,
                                height: '55%',      // half the height
                                backgroundColor: ends[index].props.color,
                                pointerEvents: 'none', // so it doesn't block mouse events
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        ))}
        <div className='flex flex-row h-full justify-between w-full z-5 text-white'>
            <div className='bg-gray-600 w-16 max-w-[15vw] border-2 border-black'></div>
            <div className='bg-gray-600 w-16 max-w-[15vw] border-2 border-black'></div>
        </div>
    </div>
  );
};
