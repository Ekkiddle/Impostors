import { useEffect, useRef, useState } from "react";

export default function ShieldsTask() {
    const [dots, setDots] = useState([]);
    const [hexagons, setHexagons] = useState([]);
    const [completed, setCompleted] = useState(false);
    const completedRef = useRef(false);
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const numDots = width * height * 0.001;

        const newDots = Array.from({ length: numDots }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            id: Math.random().toString(36).substr(2, 9),
        }));
        setDots(newDots);

        const centerX = width / 2;
        const centerY = height / 2;
        const hexDistance = width * 0.3;

        const newHexagons = [];

        newHexagons.push({ id: "0", x: centerX, y: centerY, clicked: false });

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const x = centerX + hexDistance * Math.cos(angle);
            const y = centerY + hexDistance * Math.sin(angle);
            newHexagons.push({ id: `outer-${i + 1}`, x, y, clicked: false });
        }

        setHexagons(newHexagons);
    }, []);

    const handleHexClick = (id) => {
        if (completed) return;

        setHexagons((prev) => {
            const updated = prev.map((hex) => {
                if (hex.id === id && !hex.clicked) {
                    return { ...hex, clicked: true };
                }
                return hex;
            });

            const allClicked = updated.every((hex) => hex.clicked);
            if (allClicked) {
                completedRef.current = true; 
                setCompleted(true);
                console.log("Success!");
                return updated;
            }

            // Revert back after 1 second
            const clickedHex = updated.find((hex) => hex.id === id);
            if (clickedHex) {
                setTimeout(() => {
                    setHexagons((curr) => {
                        // If we've already completed, don't revert
                        if (completedRef.current) return curr;
                        return curr.map((hex) =>
                            hex.id === id ? { ...hex, clicked: false } : hex
                        );
                    });
                }, 2000);
            }

            return updated;
        });
    };

    return (
        <div className="relative flex justify-center items-center h-full w-full bg-gray-400">
            <div className="absolute z-1 left-[6%] top-[9%] h-[90%] bg-gray-600 aspect-square rounded-full"></div>
            <div
                className="relative z-15 overflow-hidden h-[90%] m-[5%] aspect-square rounded-full border border-black bg-[radial-gradient(circle,_rgba(96,165,250,1)_0%,_black_200%)]"
                ref={containerRef}
            >
                {/* Grid Lines */}
                {[...Array(10)].map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-[1px] bg-sky-900 opacity-60"
                        style={{ left: `${(i + 1) * 10}%` }}
                    />
                ))}
                {[...Array(10)].map((_, i) => (
                    <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-[1px] bg-sky-900 opacity-60"
                        style={{ top: `${(i + 1) * 10}%` }}
                    />
                ))}

                {/* Dots */}
                {dots.map((dot) => (
                    <div
                        key={dot.id}
                        className="absolute w-[3px] aspect-square rounded-full bg-white opacity-60"
                        style={{
                            left: dot.x,
                            top: dot.y,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                ))}

                {/* Hexagons */}
                {hexagons.map((hex) => (
                    <div
                        key={hex.id}
                        onClick={() => handleHexClick(hex.id)}
                        className={`absolute w-[28%] aspect-square cursor-pointer transition duration-200 ${
                            hex.clicked
                                ? "bg-white/50 border-white"
                                : "bg-red-500/50 border-red-500"
                        } border-[3px]`}
                        style={{
                            left: hex.x,
                            top: hex.y,
                            transform: "translate(-50%, -50%)",
                            clipPath:
                                "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                        }}
                        title={hex.id}
                    />
                ))}
            </div>
        </div>
    );
}
