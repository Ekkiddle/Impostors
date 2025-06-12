import { useState, useRef, useEffect } from "react";
import { EmbossedDiv } from "../CustomDivs";

export default function AlignEngineTask() {
    const [angle, setAngle] = useState(45); // degrees
    const angleRef = useRef(angle);
    const [success, setSuccess] = useState(false);
    const parentRef = useRef(null);
    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Convert between angle and path position
    const angleToT = (angle) => (angle + 45) / 90;
    const tToAngle = (t) => t * 90 - 45;

    const getPointOnPath = (t) => {
        const path = pathRef.current;
        if (!path) return { x: 0, y: 0 };
        const length = path.getTotalLength();
        return path.getPointAtLength(t * length);
    };

    const getSVGCoords = (event) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const transformed = point.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
    };

    const getTFromY = (targetY) => {
        const path = pathRef.current;
        if (!path) return 0;

        const length = path.getTotalLength();
        let low = 0;
        let high = length;
        let bestT = 0;
        let minDist = Infinity;

        // Binary search for Y coordinate
        for (let i = 0; i < 20; i++) {
            const mid = (low + high) / 2;
            const pt = path.getPointAtLength(mid);
            const dist = Math.abs(pt.y - targetY);

            if (dist < minDist) {
                minDist = dist;
                bestT = mid / length;
            }

            if (pt.y < targetY) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return bestT;
    };

    const arrowPos = getPointOnPath(angleToT(angle));

    const handleMouseDown = (e) => {
        if (!svgRef.current || !pathRef.current) return;
        const { x, y } = getSVGCoords(e);
        const dist = Math.hypot(arrowPos.x - x, arrowPos.y - y);
        if (dist < 5) {
            setIsDragging(true);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !svgRef.current || !pathRef.current || success) return;
        const { y } = getSVGCoords(e);
        const t = getTFromY(y);
        const newAngle = tToAngle(t);
        setAngle(newAngle);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        const finalAngle = angleRef.current
        if (!success && finalAngle > -5 && finalAngle < 5) {
            setAngle(0);
            setSuccess(true);
            console.log("Success!");
        }
    };

    useEffect(() => {
        // Initialize with random ±(10–45) angle
        const magnitude = Math.floor(Math.random() * (45 - 10 + 1)) + 10;
        const sign = Math.random() < 0.5 ? -1 : 1;
        setAngle(magnitude * sign);

        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchend", handleMouseUp)
        return () => {
            document.removeEventListener("touchend", handleMouseUp)
            document.removeEventListener("mouseup", handleMouseUp);}
    }, []);

    useEffect(() => {
        angleRef.current = angle;
    }, [angle]);
      
      

    return (
        <div className="h-full w-full">
            <EmbossedDiv
                className="flex h-full w-full bg-gray-300 p-[6%]"
                innerDimensions={{ left: 3, top: 3, bottom: 97, right: 97 }}
                ref={parentRef}
            >
                {/* LEFT PANEL */}
                <div className="relative w-[60%] h-full bg-black overflow-hidden">
                    {/* Dotted center line */}
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 border-t border-dotted border-red-500" />

                    {/* Angled red line */}
                    <div
                        className="absolute h-[1px] border-red-500 origin-right border-dashed border-t"
                        style={{
                            width: "200%",
                            top: "50%",
                            right: 0,
                            transform: `translateY(-50%) rotate(${-angle}deg)`,
                        }}
                    />
                    {/* Box outline */}
                    <div
                        className="absolute h-[50px] border-red-500 origin-right border-dashed border-1"
                        style={{
                            width: "40%",
                            top: "50%",
                            right: 0,
                            transform: `translateY(-50%) rotate(${-angle}deg)`,
                        }}
                    >
                        <div className="mx-[10%] w-[80%] h-full border-red-500 border-dashed border-x" />
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="relative w-[40%] h-full bg-gray-100 flex items-center justify-center">
                    <svg
                        ref={svgRef}
                        className="absolute w-full h-full pointer-events-auto"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                    >
                        {/* Curved path with rounded ends */}
                        <path
                            ref={pathRef}
                            d="M 60 10 Q 5 50 60 90"
                            fill="none"
                            stroke="#bbb"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Arrow marker */}
                        <g
                            transform={`translate(${arrowPos.x}, ${arrowPos.y}) rotate(${-angle})`}
                            style={{ cursor: "pointer" }}
                        >
                            <polygon points="-15,0 1,-3 1,3" fill="#828282" />
                        </g>
                    </svg>
                </div>
            </EmbossedDiv>
        </div>
    );
}
