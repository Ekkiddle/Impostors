// Swipe Card Task
import DraggableContainer from "./DraggableDiv";
import { useRef, useState } from "react";
import localFont from 'next/font/local'
import Image from "next/image";

const digi = localFont({ src: '../fonts/time.ttf' })

export default function CardTask() {
    const containerRef = useRef(null);
    const cardRef = useRef(null)
    const swipeAreaRef = useRef(null);
    const [message, setMessage] = useState('Please Insert Card');
    const [tempMessage, setTempMessage] = useState('');

    const [swiping, setSwiping] = useState(false);
    const [swiped, setSwiped] = useState(false);

    const [start, setStart] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);

    function showTemporaryMessage(newMessage, delay = 1500) {
        setMessage(newMessage);
        if (timeoutId) clearTimeout(timeoutId); // Clear old timeout
        const id = setTimeout(() => {
            if (message != "Swipe Card" || message != 'Swiping...'){
                setMessage("Please Insert Card");
            }
        }, delay);
        setTimeoutId(id);
    }    

    function isOverlapping(obj1, obj2) {
        // Get bounding rectangles for both objects
        const rect1 = obj1.current.getBoundingClientRect();
        const rect2 = obj2.current.getBoundingClientRect();
      
        // Check if there is any overlap between the two rectangles
        const horizontalOverlap = rect1.right > rect2.left && rect1.left < rect2.right;
        const verticalOverlap = rect1.bottom > rect2.top && rect1.top < rect2.bottom;
      
        // If both horizontal and vertical overlap, then they are overlapping
        return horizontalOverlap && verticalOverlap;
    }

      function evaluateSwipe(swipeRight) {
        const swipeArea = swipeAreaRef.current.getBoundingClientRect();
        const card = cardRef.current.getBoundingClientRect();
    
        const swipeDuration = (Date.now() - startTime) / 1000; // in seconds
        const swipeDistance = Math.abs(card.left - start); // pixel distance
        const swipeThreshold = swipeArea.width * 0.5;
    
        if (!swipeRight) {
            setTempMessage("Wrong Direction");
            return;
        }
    
        if (swipeDistance < swipeThreshold) {
            console.log(swipeDistance, swipeThreshold)
            setTempMessage("Didn't swipe full length");
            return;
        }
    
        if (swipeDuration < 1.5) {
            console.log(swipeDuration);
            setTempMessage("Too fast");
            return;
        }
    
        if (swipeDuration > 2.2) {
            setTempMessage("Too slow");
            return;
        }
    
        setTempMessage("Success!");
        console.log("Success")
    }
    
      

    const dragFunction = () => {
        if(isOverlapping(cardRef, swipeAreaRef)){
            if (swiping && start) {
                if (!swiped){
                    const card = cardRef.current.getBoundingClientRect()
                    const swipeArea = swipeAreaRef.current.getBoundingClientRect()
                    if (((card.right > (swipeArea.right - swipeArea.width * 0.08)) && (start < card.left))){
                        setMessage("Remove Card");
                        setSwiped(true);
                        console.log("Swipe right")
                        evaluateSwipe(true);
                    }
                    if (((card.left < (swipeArea.left + swipeArea.width * 0.08)) && (start > card.left))){
                        setMessage("Remove Card");
                        setSwiped(true);
                        console.log("Swipe left")
                        evaluateSwipe(false);
                    }
                }
                
            } else {
                if (!start){
                    setStart(cardRef.current.getBoundingClientRect().left);
                    setStartTime(Date.now());

                }
                const margin = swipeAreaRef.current.getBoundingClientRect().width * 0.1;
                setMessage('Swipe Card')
                if (start && !((start-margin) < cardRef.current.getBoundingClientRect().left && cardRef.current.getBoundingClientRect().left < (start+margin))){
                    setSwiping(true)
                    setMessage('Swiping..')
                }
            }
        }
        else{
            if (start){
                setStart(null);
                setSwiping(false);
                setSwiped(false);
                setStartTime(null);
                showTemporaryMessage(tempMessage);
            }
        }
    }



    return (
        <div className={`w-full h-full relative bg-gray-600`}>
            <DraggableContainer
                id="demo"
                ref={cardRef}
                defaultPosition={{ x: '20%', y: '75%' }}
                width={'30%'}
                height={'20%'}
                forbiddenZones={[containerRef]}
                onDrag={dragFunction}
                style={{zIndex:10}}
            >
                <div className="w-full h-full rounded-md bg-gray-200 overflow-hidden z-10">
                <img src="/card.png" alt="example" className="w-full h-full object-cover" />
                </div>
            </DraggableContainer>
            <div 
                className="absolute w-full h-[20%] top-0 left-0 bg-gray-400 z-2"
                ref={containerRef}
            ></div>
            <div className="absolute w-full h-[30%] top-0 left-0 bg-gray-400 rounded-bl-4xl border-4 border-black z-20"
                ref={swipeAreaRef}
            >
                <div className={`w-[90%] mx-[5%] mt-2 bg-green-900 h-[29%] p-1 text-white ${digi.className}`}>
                    {message}
                </div>
                <img src="/swipe.svg" className="mx-1 h-[64%]" />
            </div>
            <div className="absolute w-full h-[30%] top-[2%] left-0 bg-gray-800 rounded-bl-4xl z-5" />
            <div className="absolute w-full h-[20%] top-[25%] left-0 bg-gray-700 z-3"/>
            <div className="absolute w-full h-[15%] top-[35%] left-0 bg-gray-400 rounded-tl-4xl border-4 border-black z-5"/>
            <div className="absolute w-full h-[15%] top-[40%] left-0 bg-gray-700 rounded-tl-4xl z-4"/>
        </div>
    );
}