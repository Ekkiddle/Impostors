import React, { useRef, useState, useEffect } from "react";

export default function NavigateTask() {
  const [points, setPoints] = useState([]);
  const [finishedLines, setFinishedLines] = useState([]);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 }); // will init later
  const [success, setSuccess] = useState(false);

  const [checkpoints, setCheckpoints] = useState([
    { x: "50%", y: "15%", hit: false },
    { x: "30%", y: "50%", hit: false },
    { x: "70%", y: "70%", hit: false },
    { x: "90%", y: "90%", hit: false }, // end circle included as checkpoint
  ]);

  const [dots, setDots] = useState([]);

  const isDrawing = useRef(false);
  const containerRef = useRef(null);

  const radius = 20;

  // percent-based positions:
  const startCircle = { x: "10%", y: "10%" };

  // Helper to convert "50%" -> pixels relative to container width/height
  const percentToPx = (pos, width, height) => {
    return {
      x:
        typeof pos.x === "string" && pos.x.includes("%")
          ? (parseFloat(pos.x) / 100) * width
          : pos.x,
      y:
        typeof pos.y === "string" && pos.y.includes("%")
          ? (parseFloat(pos.y) / 100) * height
          : pos.y,
    };
  };

  // Get container size & compute pixel positions of key points
  const getPositions = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      start: percentToPx(startCircle, rect.width, rect.height),
      checkpointsPx: checkpoints.map((cp) => ({
        ...cp,
        ...percentToPx(cp, rect.width, rect.height),
      })),
      width: rect.width,
      height: rect.height,
    };
  };

  const getAngle = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  };  

  
  // Initialize circlePos at start circle position on mount. And initializes dots on screen
  useEffect(() => {
    const pos = getPositions();
    if (pos) {
      setCirclePos(pos.start);
    }
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const numDots = width * height * 0.001;

    // Generate dots inside container
    const newDots = Array.from({ length: numDots }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      id: Math.random().toString(36).substr(2, 9), // unique id
    }));

    setDots(newDots);
    // Generate 3 monotonic increasing X and Y coordinates
    const xs = [30, 50, 70]; // midpoints, will randomize around these
    const ys = [30, 50, 70];

    // Add randomness within bounds, keeping order
    const randomizedCheckpoints = xs.map((baseX, i) => {
        const jitterX = Math.round(baseX + (Math.random() * 40 - 20));
        const jitterY = Math.round(ys[i] + (Math.random() * 40 - 20));

        return {
        x: `${Math.min(Math.max(jitterX, 5), 85)}%`,
        y: `${Math.min(Math.max(jitterY, 5), 85)}%`,
        hit: false
        };
    });

    // Sort by X and Y both to enforce a consistent path direction (no crossing)
    //randomizedCheckpoints.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));
    console.log([...randomizedCheckpoints, { x: "90%", y: "90%", hit: false }])
    setCheckpoints([...randomizedCheckpoints, { x: "90%", y: "90%", hit: false }])
  }, []);

  const getRelativeCoords = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const isInCircle = (point, center) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  };

  // Find the index of the next checkpoint to hit (first not hit)
  const nextCheckpointIndex = () => {
    return checkpoints.findIndex((cp) => !cp.hit);
  };

  const handleStart = (e) => {
    if (success) return;

    const positions = getPositions();
    if (!positions) return;

    const point = getRelativeCoords(e);

    if (!isInCircle(point, circlePos)) return;

    isDrawing.current = true;
    setPoints([point]);
    setCirclePos(point);
  };

  const handleMove = (e) => {
    if (!isDrawing.current || success) return;

    const positions = getPositions();
    if (!positions) return;

    const point = getRelativeCoords(e);

    setPoints((prev) => {
      // Get next checkpoint index to hit
      const nextIdx = nextCheckpointIndex();

      // If next checkpoint is hit by the current point, mark it as hit
      let newCheckpoints = [...checkpoints];
      if (nextIdx !== -1 && isInCircle(point, positions.checkpointsPx[nextIdx])) {
        newCheckpoints[nextIdx] = { ...newCheckpoints[nextIdx], hit: true };
        setCheckpoints(newCheckpoints);
      }

      return [...prev, point];
    });

    setCirclePos(point);
  };

  const handleEnd = (e) => {
    if (!isDrawing.current || success) return;

    const positions = getPositions();
    if (!positions) return;

    isDrawing.current = false;
    const point = getRelativeCoords(e);

    const allHit = checkpoints.every((cp) => cp.hit);
    const lastCheckpoint = positions.checkpointsPx[positions.checkpointsPx.length - 1];

    // Success only if all checkpoints hit and ended on last checkpoint
    if (allHit && isInCircle(point, lastCheckpoint)) {
      setFinishedLines((prev) => [...prev, [...points, point]]);
      setSuccess(true);
      setPoints([]);
    } else {
      // Reset
      setPoints([]);
      setCirclePos(positions.start);
      setCheckpoints((prev) => prev.map((cp) => ({ ...cp, hit: false })));
    }
  };

  // Prevent scrolling while touching canvas
  useEffect(() => {
    const el = containerRef.current;
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

  const checkPointSVG = (pos, i) => {
    const numLines = 8;
    const lineLength = 6; // length of each spoke line
    const centerX = pos.x;
    const centerY = pos.y;

    // Generate 8 lines evenly spaced (360 / 8 = 45 degrees apart)
    const lines = [];
    for (let j = 0; j < numLines; j++) {
      const angle = (j * 2 * Math.PI) / numLines;
      const x1 = centerX + Math.cos(angle) * radius * 0.6;
      const y1 = centerY + Math.sin(angle) * radius * 0.6;
      const x2 = centerX + Math.cos(angle) * (radius * 0.6 + lineLength);
      const y2 = centerY + Math.sin(angle) * (radius * 0.6 + lineLength);

      lines.push(
        <line
          key={`linebg-${i}-${j}`}
          x1={x1 + 2}
          y1={y1 + 2}
          x2={x2 + 2}
          y2={y2 + 2}
          stroke="rgba(0, 0, 0, 0.5)"
          strokeWidth="4"
        />
      );
      lines.push(
        <line
          key={`line-${i}-${j}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth="4"
        />
      );
    }

    return (
      <g key={i}>
        {/* Small circle at center */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="transparent"
          stroke={checkpoints[i].hit ? "white" : "#001f4d"}
          strokeWidth="3"
        />
        {/* Ring of 8 lines around the circle */}
        {lines}

        {/* Extra circle ring around last checkpoint */}
        {i === checkpoints.length - 1 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 1.2}
            fill="none"
            stroke="yellow"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
        )}
      </g>
    );
  };

  const renderLines = () => {
    const rect = containerRef.current;
    if (!rect) return null; // early return if no container
    const lines = []
    for (let j = 0; j < checkpoints.length; j++){
        let start, end
        if (j==0){
            start = percentToPx(startCircle, rect.clientWidth, rect.clientHeight)
        } else {
            start = percentToPx(checkpoints[j-1], rect.clientWidth, rect.clientHeight)
        }
        end = percentToPx(checkpoints[j], rect.clientWidth, rect.clientHeight)
        lines.push(
            <line 
                key={`dotLine-${j}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#0f4391"
                strokeWidth="3"
                strokeDasharray="8 6"
            />
        )
    }
    return (
        <g>
            {lines}
        </g>
    )
  }

  const angle = (() => {
    if (points.length > 1) {
      return getAngle(points[Math.max(0, points.length - 5)], points[points.length - 1]);
    } else {
      const pos = getPositions();
      if (pos) {
        return getAngle(pos.start, pos.checkpointsPx[0]); // face toward first checkpoint
      }
      return 0;
    }
  })();
  

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      className="w-full h-full relative bg-blue-500"
      style={{ userSelect: "none", touchAction: "none" }}
    >
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-[3px] aspect-square rounded-full bg-white"
          style={{
            left: dot.x,
            top: dot.y,
            transform: "translate(-50%, -50%)", // center dot on coords
          }}
        />
      ))}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {renderLines()}
        {/* Completed lines */}
        {finishedLines.map((line, i) => (
          <polyline
            key={i}
            points={line.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#d4e5ff"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Active line */}
        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#d4e5ff"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Checkpoints including end */}
        {containerRef.current
          ? checkpoints
              .map((cp) =>
                percentToPx(cp, containerRef.current.clientWidth, containerRef.current.clientHeight)
              )
              .map((pos, i) => checkPointSVG(pos, i))
          : null}

        {/* Red circle (start / moving) */}
        <image
            href="/ship.svg"
            x={circlePos.x - 20}
            y={circlePos.y - 20}
            width={40}
            height={40}
            transform={`rotate(${angle}, ${circlePos.x}, ${circlePos.y})`}
            />

      </svg>
    </div>
  );
}
