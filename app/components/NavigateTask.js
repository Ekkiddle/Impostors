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
  ]);

  const isDrawing = useRef(false);
  const containerRef = useRef(null);

  const radius = 20;

  // percent-based positions:
  const startCircle = { x: "10%", y: "10%" };
  const endCircle = { x: "90%", y: "90%" };

  // Helper to convert "50%" -> pixels relative to container width/height
  const percentToPx = (pos, width, height) => {
    return {
      x: typeof pos.x === "string" && pos.x.includes("%") ? (parseFloat(pos.x) / 100) * width : pos.x,
      y: typeof pos.y === "string" && pos.y.includes("%") ? (parseFloat(pos.y) / 100) * height : pos.y,
    };
  };

  // Get container size & compute pixel positions of key points
  const getPositions = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      start: percentToPx(startCircle, rect.width, rect.height),
      end: percentToPx(endCircle, rect.width, rect.height),
      checkpointsPx: checkpoints.map((cp) => ({
        ...cp,
        ...percentToPx(cp, rect.width, rect.height),
      })),
      width: rect.width,
      height: rect.height,
    };
  };

  // Initialize circlePos at start circle position on mount
  useEffect(() => {
    const pos = getPositions();
    if (pos) {
      setCirclePos(pos.start);
    }
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
      const newCheckpoints = positions.checkpointsPx.map((cp) =>
        cp.hit || isInCircle(point, cp) ? { ...cp, hit: true } : cp
      );
      setCheckpoints(newCheckpoints);
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

    if (isInCircle(point, positions.end) && allHit) {
      console.log("Success");
      setFinishedLines((prev) => [...prev, [...points, point]]);
      setSuccess(true);
      setPoints([]);
    } else {
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
      className="w-full h-full relative bg-white"
      style={{ userSelect: "none", touchAction: "none" }}
    >
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
        {/* Completed lines */}
        {finishedLines.map((line, i) => (
          <polyline
            key={i}
            points={line.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="black"
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
            stroke="black"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* End circle */}
        {(() => {
          const pos = containerRef.current ? percentToPx(endCircle, containerRef.current.clientWidth, containerRef.current.clientHeight) : { x: 0, y: 0 };
          return (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
          );
        })()}

        {/* Checkpoints */}
        {(() => {
          const cpPx = containerRef.current
            ? checkpoints.map((cp) =>
                percentToPx(cp, containerRef.current.clientWidth, containerRef.current.clientHeight)
              )
            : [];
          return cpPx.map((pos, i) => (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={radius * 0.7}
              fill={checkpoints[i].hit ? "green" : "gray"}
              stroke="black"
              strokeWidth="2"
            />
          ));
        })()}

        {/* Red circle (start / moving) */}
        <circle
          cx={circlePos.x}
          cy={circlePos.y}
          r={radius}
          fill="red"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
