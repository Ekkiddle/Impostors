'use client'

import { useRef, useState } from "react";
import DraggableWire from "@/app/components/DraggableWire";
import WireTarget from "@/app/components/WireTarget";
import WireTask from "@/app/components/WireTask";

export default function TaskPage(){
    const targetRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [hovering, setHovering] = useState(false);
    return (
        <div className="w-screen h-screen overflow-hidden">
            
            <div className="flex flex-row gap-40 relative w-screen h-64 bg-red-100">
                <DraggableWire
                    color="blue"
                    targetRef={targetRef}
                    onConnection={() => setConnected(true)}
                    setHoveringTarget={setHovering}
                    hoveringTarget={hovering}
                />
                <WireTarget
                    ref={targetRef}
                    isHovering={hovering}
                />
            </div>
            <WireTask />
        </div>
    )
}