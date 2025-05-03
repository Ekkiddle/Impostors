// Swipe Card Task
import DraggableContainer from "./DraggableDiv";

export default function CardTask() {
    return (
        <div className="w-full h-full relative bg-black">
            <DraggableContainer
                id="demo"
                defaultPosition={{ x: '20%', y: '75%' }}
                width={'30%'}
                height={'20%'}
            >
                <div className="w-full h-full rounded-md bg-gray-200 overflow-hidden">
                <img src="/card.png" alt="example" className="w-full h-full object-cover" />
                </div>
            </DraggableContainer>
        </div>
    );
}