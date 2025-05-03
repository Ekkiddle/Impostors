'use client'

import { useRef, useState } from "react";
import WireTask from "@/app/components/WireTask";
import CardTask from "@/app/components/SwipeCard";

export default function TaskPage(){
    const [task, setTask] = useState(<WireTask />);

    return (
    <>
        <div className="flex flex-row gap-2">
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<WireTask />)}>Wire Task</button>
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<CardTask />)}>Card Task</button>
        </div>
        <div className="w-screen h-[60vh]">
            {task}
        </div>
    </>
    );

}