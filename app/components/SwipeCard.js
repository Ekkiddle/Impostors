// Swipe Card Task
import DraggableContainer from "./DraggableDiv";
import { useRef, useState } from "react";
import localFont from 'next/font/local'

const digi = localFont({ src: '../fonts/time.ttf' })

export default function CardTask() {
    const containerRef = useRef(null);
    const cardRef = useRef(null)
    const swipeAreaRef = useRef(null);
    const [message, setMessage] = useState('Please Insert Card')

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
      

    const dragFunction = () => {
        if(isOverlapping(cardRef, swipeAreaRef)){
            setMessage('Swipe Card')
        }
        else{
            setMessage("Please Insert Card")
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
                <div className={`w-[90%] mx-[5%] mt-2 bg-green-900 h-8 p-1 text-white ${digi.className}`}>
                    {message}
                </div>
            </div>
            <div className="absolute w-full h-[30%] top-[2%] left-0 bg-gray-800 rounded-bl-4xl z-5" />
            <div className="absolute w-full h-[20%] top-[25%] left-0 bg-gray-700 z-3"/>
            <div className="absolute w-full h-[15%] top-[35%] left-0 bg-gray-400 rounded-tl-4xl border-4 border-black z-5"/>
            <div className="absolute w-full h-[15%] top-[40%] left-0 bg-gray-700 rounded-tl-4xl z-4"/>
        </div>
    );
}