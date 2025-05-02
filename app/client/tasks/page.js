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
            <WireTask />
        </div>
    )
}