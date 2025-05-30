'use client'

import { useRef, useState } from "react";
import WireTask from "@/app/components/WireTask";
import CardTask from "@/app/components/SwipeCard";
import AsteroidsTask from "@/app/components/AsteroidsTask";
import SequenceTask from "@/app/components/SequenceTask";

export default function TaskPage(){
    const [task, setTask] = useState(<WireTask />);

    return (
    <div className="flex flex-col items-center h-full w-full">
        <div className="flex flex-row gap-2">
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<WireTask />)}>Wire Task</button>
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<CardTask />)}>Card Task</button>
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<AsteroidsTask />)}>Asteroid Task</button>
            <button className='bg-blue-400 rounded-lg' onClick={() => setTask(<SequenceTask />)}>Start Reactor</button>
        </div>
        <div className="max-w-[100vw] h-100 max-h-[110vw] w-100 border-black border-3">
            {task}
        </div>
    </div>
    );

}