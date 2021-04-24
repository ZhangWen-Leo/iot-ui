import React, { useState, useCallback } from 'react'
import { NativeTypes } from 'react-dnd-html5-backend'
import Dustbin from './Dustbin'
import Box from './Box'
import ItemTypes from './ItemTypes'
import update from 'immutability-helper'

interface DustbinState {
    accepts: string[]
    lastDroppedItem: any
}

interface BoxState {
    name: string
    type: string
}

export interface DustbinSpec {
    accepts: string[]
    lastDroppedItem: any
}
export interface BoxSpec {
    name: string
    type: string
}
export interface ContainerState {
    droppedBoxNames: string[]
    dustbins: DustbinSpec[]
    boxes: BoxSpec[]
}

const Container: React.FC = () => {
    const [dustbins, setDustbins] = useState<DustbinState[]>([
        { accepts: [ItemTypes.GLASS, ItemTypes.FOOD, ItemTypes.PAPER], lastDroppedItem: null },
        // { accepts: [ItemTypes.FOOD], lastDroppedItem: null },
        // {
        //     accepts: [ItemTypes.PAPER, ItemTypes.GLASS, NativeTypes.URL],
        //     lastDroppedItem: null,
        // },
        // { accepts: [ItemTypes.PAPER, NativeTypes.FILE], lastDroppedItem: null },
    ])

    const initResult: any[] = [];
    const [result, setResult] = useState(initResult);

    const [boxes] = useState<BoxState[]>([
        { name: 'Bottle', type: ItemTypes.GLASS },
        { name: 'Banana', type: ItemTypes.FOOD },
        { name: 'Magazine', type: ItemTypes.PAPER },
    ])

    const [droppedBoxNames, setDroppedBoxNames] = useState<string[]>([])

    function isDropped(boxName: string) {
        // return droppedBoxNames.indexOf(boxName) > -1
        return false;
    }

    const handleDrop = useCallback(
        (index: number, item: { name: string }) => {
            result.push(item);
            setResult(result);
            // setDroppedBoxNames(
            //     update(droppedBoxNames, name ? { $push: [name] } : { $push: [] }),
            // )
            // setDustbins(
            //     update(dustbins, {
            //         [index]: {
            //             lastDroppedItem: {
            //                 $set: item,
            //             },
            //         },
            //     }),
            // )
        },
        [droppedBoxNames, dustbins],
    )

    return (
        <div>
            <div style={{ overflow: 'hidden', clear: 'both' }}>
                {dustbins.map(({ accepts, lastDroppedItem }, index) => (
                    <Dustbin
                        accept={accepts}
                        lastDroppedItem={lastDroppedItem}
                        dropResult={result}
                        onDrop={item => handleDrop(index, item)}
                        key={index}
                    />
                ))}
            </div>

            <div style={{ overflow: 'hidden', clear: 'both' }}>
                {boxes.map(({ name, type }, index) => (
                    <Box
                        name={name}
                        type={type}
                        isDropped={isDropped(name)}
                        key={index}
                    />
                ))}
            </div>
        </div>
    )
}

export default Container
