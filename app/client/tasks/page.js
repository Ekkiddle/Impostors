'use client'

import { useRef, useState } from "react";
import WireTask from "@/app/components/tasks/WireTask";
import CardTask from "@/app/components/tasks/SwipeCard";
import AsteroidsTask from "@/app/components/tasks/AsteroidsTask";
import SequenceTask from "@/app/components/tasks/SequenceTask";
import NavigateTask from "@/app/components/tasks/NavigateTask";
import SteeringTask from "@/app/components/tasks/SteeringTask";
import ShieldsTask from "@/app/components/tasks/ShieldsTask";

export default function TaskPage(){
    const [task, setTask] = useState(<WireTask />);

    const handleChange = (e) => {
        const value = e.target.value;
        switch (value) {
          case "Wire":
            setTask(<WireTask />);
            break;
          case "Card":
            setTask(<CardTask />);
            break;
          case "Asteroids":
            setTask(<AsteroidsTask />);
            break;
          case "Reactor":
            setTask(<SequenceTask />);
            break;
          case "Navigate":
            setTask(<NavigateTask />);
            break;
          case "Stabilize":
            setTask(<SteeringTask />);
            break;
          case "Shields":
            setTask(<ShieldsTask />);
            break;
          default:
            setTask(null);
        }
      };

    return (
    <div className="flex flex-col items-center h-full w-full">
        <div className="w-fit">
            <select
                onChange={handleChange}
                className="bg-blue-400 text-white p-2 rounded-lg"
                defaultValue=""
            >
                <option value="" disabled>Select a Task</option>
                <option value="Wire">Wire Task</option>
                <option value="Card">Card Task</option>
                <option value="Asteroids">Asteroid Task</option>
                <option value="Reactor">Start Reactor</option>
                <option value="Navigate">Navigation</option>
                <option value="Stabilize">Stabilize Steering</option>
                <option value="Shields">Prime Shields</option>
            </select>
        </div>
        <div className="max-w-[100vw] w-100 aspect-square border-black border-3">
            {task}
        </div>
    </div>
    );

}