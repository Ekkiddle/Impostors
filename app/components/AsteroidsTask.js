import AsteroidField from "./Asteroid";
import SpaceBackground from "./SpaceBackground";
import { useRef, useState, useEffect } from "react";

export default function AsteroidsTask() {
    const [lines, setLines] = useState([
        { startX: 0, startY: 0, endX: 0, endY: 0 }, // First line
        { startX: 0, startY: 0, endX: 0, endY: 0 }, // Second line
    ]);

    const [count, setCount] = useState(20);

    const containerRef = useRef(null);

    const updateLines = (x, y) => {
        const parentRect = containerRef.current.getBoundingClientRect();
        setLines([
            { startX: 0, startY: parentRect.height, endX: x, endY: y },
            { startX: parentRect.width, startY: parentRect.height, endX: x, endY: y },
        ]);
    };

    useEffect(() => {
        const parentRect = containerRef.current.getBoundingClientRect();
        const centerX = parentRect.width / 2;
        const centerY = parentRect.height / 2;

        updateLines(centerX, centerY);

        const handleMove = (e) => {
            e.preventDefault();
            
            // Get the mouse/touch position relative to the parent container
            const x = (e.clientX || e.touches[0].clientX) - parentRect.left;
            const y = (e.clientY || e.touches[0].clientY) - parentRect.top;
        
            // Check if the position is inside the parent container bounds
            if (x < 0 || x > parentRect.width || y < 0 || y > parentRect.height) {
                return; // Don't update lines if outside parentRect
            }
        
            // Update lines only if inside parentRect
            updateLines(x, y);
        };
        

        window.addEventListener("mousemove", handleMove, { passive: false });
        window.addEventListener("touchmove", handleMove, { passive: false });
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("touchmove", handleMove);
        };
    }, []);

    const handleClick = (event) => {
        const parentRect = containerRef.current.getBoundingClientRect();
        const endX = event.clientX - parentRect.left;
        const endY = event.clientY - parentRect.top;
        setLines([
            { startX: 0, startY: parentRect.height, endX, endY },
            { startX: parentRect.width, startY: parentRect.height, endX, endY },
        ]);
    };

    const handleAstroid = () => {
        if((count-1) === 0){
            console.log("Success")
            setTimeout(()=>setCount(20), 2000)
        }
        setCount(Math.max(count-1, 0))
    }

    return (
        <div
            className="relative w-full h-full"
            onClick={handleClick}
            ref={containerRef}
        >
            <SpaceBackground />
            <AsteroidField onClick={handleAstroid}/>
            <div className="absolute top-5 left-0 w-full flex flex-col items-center text-white font-orbitron z-40"
                style={{ pointerEvents: 'none' }}
            >
                <p>Asteroids left: {count}</p>
            </div>

            {/* Lines */}
            {lines.map((line, index) => (
                <svg
                    key={index}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 20 }}
                >
                    <line
                        x1={line.startX}
                        y1={line.startY}
                        x2={line.endX}
                        y2={line.endY}
                        stroke="#2c304b"
                        strokeWidth={3}
                    />
                </svg>
            ))}

            {/* Crosshair */}
            <svg
                width={40}
                height={40}
                className="absolute pointer-events-none"
                style={{
                    left: `${lines[0].endX - 20}px`,
                    top: `${lines[0].endY - 20}px`,
                    zIndex: 30,
                }}
            >
                <rect
                    x="5"
                    y="5"
                    width="30"
                    height="30"
                    stroke="#9da5d2"
                    strokeWidth="3"
                    fill="none"
                />
                {/* Outer ticks */}
                <line x1="0" y1="20" x2="10" y2="20" stroke="#9da5d2" strokeWidth="2" />
                <line x1="30" y1="20" x2="40" y2="20" stroke="#9da5d2" strokeWidth="2" />
                <line x1="20" y1="0" x2="20" y2="10" stroke="#9da5d2" strokeWidth="2" />
                <line x1="20" y1="30" x2="20" y2="40" stroke="#9da5d2" strokeWidth="2" />

                {/* Center + */}
                <line x1="15" y1="20" x2="25" y2="20" stroke="#9da5d2" strokeWidth="2" />
                <line x1="20" y1="15" x2="20" y2="25" stroke="#9da5d2" strokeWidth="2" />
            </svg>
        </div>
    );
}
