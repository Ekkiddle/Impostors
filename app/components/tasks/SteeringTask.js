import { useEffect, useRef, useState } from "react"

export default function SteeringTask() {
    const [coords, setCoords] = useState({x: 0, y: 0})
    const parentContainer = useRef();
    const [success, setSuccess] = useState(false);
    const isMoving = useRef(false);

    useEffect(() => {
        // Get random coord starting position in a spot around the circle...
        const rect = parentContainer.current.getBoundingClientRect();
        const centerX = rect.width *0.5;
        const centerY = rect.height *0.5;

        const radius = rect.width / 4;
        let angle = Math.random() * 2 * Math.PI;

        setCoords({x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle)})
    }, [])

    // Prevent scrolling while touching canvas
    useEffect(() => {
        const el = parentContainer.current;
        const preventScroll = (e) => e.preventDefault();
        if (el) {
            el.addEventListener("touchstart", preventScroll, { passive: false });
            el.addEventListener("touchmove", preventScroll, { passive: false });
        }
        return () => {
            if (el) {
                el.removeEventListener("touchstart", preventScroll);
                el.removeEventListener("touchmove", preventScroll);
            }
        };
    }, []);

    const handleMove = (e) => {
        if (!isMoving.current || success) return;
        const rect = parentContainer.current.getBoundingClientRect();

        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
          } else {
            clientX = e.clientX;
            clientY = e.clientY;
          }
      
          setCoords({
            x: clientX - rect.left,
            y: clientY - rect.top,
          });

    }
    const handleStart = (e) => {
        isMoving.current = true;
    }
    const handleEnd = (e) => {
        isMoving.current = false;
        const rect = parentContainer.current.getBoundingClientRect();
        
        const xBounds = coords.x > rect.width*0.48 && coords.x < rect.width*0.52
        const yBounds = coords.y > rect.height*0.48 && coords.y < rect.height*0.52
        if (xBounds && yBounds){
            console.log("Success!")
            setSuccess(true);
            setCoords({x: rect.width/2-1, y: rect.height/2-1})
        }
    }
    return (
        <div className="flex justify-center align-center h-full w-full bg-gray-300">
            <div className="h-[96%] m-[2%] aspect-square bg-gray-500 rounded-full border-3 border-black">
                <div className="relative overflow-hidden h-[98%] m-[1%] aspect-square rounded-full border-2 border-black bg-[radial-gradient(circle,_rgba(96,165,250,1)_0%,_black_150%)]"
                    ref={parentContainer}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                >
                    {/* Vertical Lines */}
                    {[...Array(10)].map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-[1px] bg-sky-900 opacity-60"
                        style={{ left: `${(i + 1) * 10}%` }}
                    />
                    ))}
                    {/* Horizontal Lines */}
                    {[...Array(10)].map((_, i) => (
                    <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-[1px] bg-sky-900 opacity-60"
                        style={{ top: `${(i + 1) * 10}%` }}
                    />
                    
                    ))}
                    <div className="absolute left-[50%] top-[45%] h-[10%] w-[2px] bg-white"></div>
                    <div className="absolute left-[45%] top-[50%] w-[10%] h-[2px] bg-white"></div>
                    <div className="absolute left-50 top-50 border-2 border-white w-[60px] aspect-square rounded-full"
                        style={{left:coords.x-30, top:coords.y-30}}
                    >
                        <div className="m-[35%] w-[30%] aspect-square border-2 border-white rounded-full"></div>
                    </div>
                    <div className="absolute w-[2px] h-full top-0 bg-white" style={{left:coords.x-1}}></div>
                    <div className="absolute h-[2px] w-full left-0 bg-white" style={{top:coords.y-1}}></div>
                </div>
            </div>
        </div>
    )
}