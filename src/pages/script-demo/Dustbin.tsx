import React from 'react'
import { useDrop } from 'react-dnd'

const style: React.CSSProperties = {
    height: '30rem',
    width: '120rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
}

export interface DustbinProps {
    accept: string[]
    lastDroppedItem?: any
    dropResult: any[]
    onDrop: (item: any, monitor: any) => void
}

const Dustbin: React.FC<DustbinProps> = ({
    accept,
    lastDroppedItem,
    dropResult,
    onDrop,
}) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: onDrop,
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const isActive = isOver && canDrop
    let backgroundColor = '#222'
    if (isActive) {
        backgroundColor = 'darkgreen'
    } else if (canDrop) {
        backgroundColor = 'darkkhaki'
    }

    return (
        <div ref={drop} style={{ ...style, backgroundColor }}>
            {/* {isActive
                ? 'Release to drop'
                : `This dustbin accepts: ${accept.join(', ')}`} */}

            {/* {lastDroppedItem && ( */}
            <p>Last dropped: {JSON.stringify(dropResult)}</p>
            {/* )} */}
        </div>
    )
}

export default Dustbin
