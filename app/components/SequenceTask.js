import React, { useState, useEffect } from 'react';

const getRandomSequence = () => {
  const sequence = [];
  while (sequence.length < 5) {
    const rand = Math.floor(Math.random() * 9);
    sequence.push(rand);
  }
  return sequence;
};

export default function SequenceTask() {
    const [sequence, setSequence] = useState(getRandomSequence);
    const [stage, setStage] = useState(1);
    const [input, setInput] = useState([]);
    const [showSequence, setShowSequence] = useState(true);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isPaused, setIsPaused] = useState(true); // true = black screen phase
    const [error, setError] = useState(false);

  
    useEffect(() => {
        if (!showSequence || stage > 5) return;
      
        if (isPaused) {
          // Show black screen for 250ms
          const pauseTimer = setTimeout(() => {
            setIsPaused(false);
          }, 250);
          return () => clearTimeout(pauseTimer);
        } else {
          // Show highlight for 600ms
          const highlightTimer = setTimeout(() => {
            setError(false);
            if (highlightIndex < stage - 1) {
              setHighlightIndex(prev => prev + 1);
              setIsPaused(true); // go back to black screen for next one
            } else {
              // End of sequence
              setShowSequence(false);
              setHighlightIndex(0);
              setIsPaused(true); // reset
            }
          }, 600);
          return () => clearTimeout(highlightTimer);
        }
      }, [highlightIndex, isPaused, showSequence, stage]);
      
  
    const handleButtonClick = (index) => {
      if (showSequence) return;
  
      const newInput = [...input, index];
      setInput(newInput);
  
      for (let i = 0; i < newInput.length; i++) {
        if (newInput[i] !== sequence[i]) {
          console.log('Wrong sequence! Try again.');
          setError(true)
          setInput([]);
          setShowSequence(true);
          setHighlightIndex(-1);
          return;
        }
      }
  
      if (newInput.length === stage) {
        if (stage === 5) {
          console.log("Success!")
          setStage(6)
          setTimeout(()=>setStage(1),2000)
          setSequence(getRandomSequence());
        } else {
          setStage(stage + 1);
        }
        setInput([]);
        setShowSequence(true);
        setHighlightIndex(-1);
      }
    };
  
    const renderGridSquare = (index, isDisplay = false) => {
        let isLit = false;
        if (isDisplay && showSequence && highlightIndex >= 0 && !isPaused) {
          isLit = sequence[highlightIndex] === index;
        }
      
        return (
          <div
            key={index}
            className={`w-12 h-12 m-1 ${
              isDisplay
                ? isLit
                  ? 'bg-blue-500'
                  : 'bg-black'
                : 'bg-blue-500 border-t-2 border-l-2 border-black border-b-2 border-r-2 border-black hover:bg-blue-600 cursor-pointer rounded-sm flex items-center justify-center text-white text-lg'
            }`}
            onClick={!isDisplay ? () => handleButtonClick(index) : undefined}
          >
          </div>
        );
      };
      
      
  
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 p-[2%]">
            <div className="flex space-x-3 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 border-black ${
                        error ? 'bg-red-500' : i < (stage-1) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    />
                ))}
            </div>

        
            <div className="flex flex-row justify-center gap-4 w-full">
            {/* Display Section (Left) */}
            <div className="w-[45%] aspect-square bg-black p-2 rounded-lg grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }, (_, i) => renderGridSquare(i, true))}
            </div>
        
            {/* Button Grid Section (Right) */}
            <div className="w-[45%] aspect-square grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }, (_, i) => renderGridSquare(i, false))}
            </div>
            </div>
        </div>
    );
  }