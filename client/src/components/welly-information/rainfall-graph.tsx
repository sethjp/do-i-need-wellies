import React, { useState } from 'react';
import { Rainfall } from '../../util/rain/rainfall/rainfall';
import { RainLevel } from '../../util/rain/rain-level/rain-level';

type Coords = {x: number, y: number}

interface RainfallGraphProps {
    dailyRainfall: Rainfall[];
    setRainfallAmount: (rainfall: Rainfall) => void;
}

export function RainfallGraph({dailyRainfall, setRainfallAmount}: RainfallGraphProps) {
    
    
    // const rainfall = insertMissingRainfall(dailyRainfall);
    
    const dates: number[] = dailyRainfall.map(rainfall => {
        return rainfall.fellOn.getDate();
    });

    const barWidth = 20;
    const height = findMaxRainfall(dailyRainfall).amount.millimetres + 20;
    // const graphWidth = 650;
    const graphWidth = dates.length * barWidth + 50;

    const viewBox = `0 0 ${graphWidth} ${height + 50} `

    const startCoords: Coords = { x: 30, y: 30 };
    return (
        <svg 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg"
            width={graphWidth} 
            height={height + 50} 
            viewBox={viewBox} 
        >
            <Bars startCoords={startCoords} graphHeight={height} barWidth={barWidth} rainfall={dailyRainfall} setRainfallAmount={setRainfallAmount}/>
            <Axes startCoords={startCoords} height={height} barWidth={barWidth} dates={dates} />
        </svg>
    )
}

function findMaxRainfall(monthOfRainfall: Rainfall[]) {
    return monthOfRainfall.reduce((mostRainfall, rainfall) => { return rainfall.amount.millimetres > mostRainfall.amount.millimetres ? rainfall : mostRainfall; }, new Rainfall(RainLevel.NONE, 0));
}

interface BarsProps {
    startCoords: Coords;
    graphHeight: number;
    barWidth: number;
    rainfall: Rainfall[];
    setRainfallAmount: (rainfall: Rainfall) => void;
}

function Bars({barWidth, graphHeight, rainfall, startCoords, setRainfallAmount}: BarsProps) {
    const bottomOfBar = startCoords.y + graphHeight;
    
    return (
        <>
        <g
            fill='blue'
        >

        {rainfall.map((rainfall, index) => {
            const barHeight = rainfall.amount.millimetres;
            const y = bottomOfBar - barHeight
            const x = index * barWidth + 1 + startCoords.x
            return (
                <Bar
                    key={index} 
                    x={x}
                    y={y}
                    height={barHeight}
                    width={barWidth-2}
                    setRainfallAmount={setRainfallAmount}
                    rainfall={rainfall}
                />
            )
        })}
        </g>
        </>
    )
}

interface BarProps {
    x: number;
    y: number;
    height: number;
    width: number;
    setRainfallAmount: (rainfall: Rainfall) => void;
    rainfall: Rainfall;
}

function Bar({x, y, height, width, setRainfallAmount, rainfall}: BarProps) {
    const [barColor, setBarColor] = useState("blue");

    function handleClick() {
        setRainfallAmount(rainfall);
        setBarColor("red");
        waitThenChangeBarColorBackTo("blue");
    }

    function handlePointerEnter(rect: any) {
        setBarColor("#66f");
    }

    function handlePointerLeave(rect: any) {
        setBarColor("blue");
    }

    function waitThenChangeBarColorBackTo(color: string) {
        setTimeout(() => {
            setBarColor(color);
        }, 1000)
    }

    return (
        <rect
            x={x}
            y={y}
            height={height}
            width={width}
            onClick={handleClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            fill={barColor}
        />
    )
}

interface AxesProps {
    height: number,
    startCoords: Coords,
    barWidth: number,
    dates: number[]
}

function Axes({height, startCoords, dates, barWidth}: AxesProps): JSX.Element {
    const width = barWidth * dates.length;
    const startX = startCoords.x;
    const endX =  startX + width;
    const startY = startCoords.y;
    const endY = startY + height;

    return (
        <>
            <g
                stroke='black'
                strokeWidth={2}
                strokeLinecap='square'
            >
                <line 
                    x1={startX} 
                    y1={startY} 
                    x2={startX} 
                    y2={endY}
                    
                />
                <line 
                    x1={startX}
                    y1={endY}
                    x2={endX}
                    y2={endY}
                />
            </g>
            <RainfallScale width={width} height={height} startCoords={startCoords}/>
            <DateScale height={height} dates={dates} startCoords={startCoords} barWidth={barWidth} />
        </>

    )
}

interface DateScaleProps {
    dates: number[],
    height: number,
    startCoords: Coords,
    barWidth: number
}

function DateScale({height, startCoords, dates, barWidth}: DateScaleProps) {
    const y = startCoords.y + height + 20;

    const fontSize = 12;
    
    return (
        <>  
        <g
        textAnchor='middle'
        fill='black'
        fontSize={fontSize}
        >
            {dates.map((date, index) =>{
                return (
                    <text
                        x={startCoords.x + index*barWidth + barWidth/2}
                        y={y}
                        key={index}
                    >{date}</text>
                )
            })}
        </g>
        </>
    )
}

interface RainfallScaleProps {
    width: number,
    height: number,
    startCoords: Coords
}

function RainfallScale({width, height, startCoords}: RainfallScaleProps) {
    const divisionSize = 20;
    
    const ratio = height / divisionSize;
    const numberOfDivisions = Math.ceil(Number.isInteger(ratio)? ratio + 1: ratio)

    return (
        <>
            <Notches height={height} startCoords={startCoords} divisionSize={divisionSize} numberOfDivisions={numberOfDivisions}/>
            <Scale height={height} startCoords={startCoords} divisionSize={divisionSize} numberOfDivisions={numberOfDivisions}/>
            <HorizontalGridLines height={height} width={width} numberOfDivisions={numberOfDivisions} divisionSize={divisionSize} startCoords={startCoords} />
        </>
    )
}

interface HorizontalGridLinesProps {
    width: number;
    divisionSize: number;
    startCoords: Coords;
    height: number;
    numberOfDivisions: number;
}

function HorizontalGridLines({numberOfDivisions, width, height, divisionSize, startCoords}: HorizontalGridLinesProps) {
    const horizontalGridLines: JSX.Element[] = [];    
    const x = startCoords.x;
    for (let i = 0; i < numberOfDivisions; i++) {
        const y = startCoords.y + height - i * divisionSize;
        horizontalGridLines.push(
            <line 
                key={i}
                x1={x}
                y1={y + 0.5}
                x2={x + width}
                y2={y + 0.5}
                strokeWidth="1"
                strokeOpacity="0.2"
                strokeDasharray="4, 4"
            />
        )
    }
    return (
        <g
            stroke='black'
            strokeWidth={2}
            strokeLinecap='square'
            strokeDasharray="5, 5"
        >
        {horizontalGridLines.map(line => {
            return line;
        })}
        </g>
    );
}

interface NotchesProps {
    height: number,
    startCoords: Coords,
    divisionSize: number,
    numberOfDivisions: number
}

function Notches({height, startCoords, divisionSize, numberOfDivisions}: NotchesProps) {
    const notches: JSX.Element[] = [];    
    const x1 = startCoords.x;
    const x2 = startCoords.x - 5;
    for (let i = 0; i < numberOfDivisions; i++) {
        const y = startCoords.y + height - i * divisionSize;
        notches.push(
            <line 
                key={i}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
            />
        )
    }

    return (
        <>
            <g
                stroke='black'
                strokeWidth={2}
                strokeLinecap='square'
            >
                {notches.map((notch) => {
                    return notch;
                })}
            </g>
        </>
    )
}

interface ScaleProps {
    height: number,
    startCoords: Coords,
    divisionSize: number,
    numberOfDivisions: number,
}

function Scale({height, startCoords, divisionSize, numberOfDivisions}: ScaleProps) {
    const numbersOnTheScale: JSX.Element[] = []
    const centerX = 10;

    const fontSize = 12;

    for (let i = 0; i < numberOfDivisions; i ++) {
        const centerY = startCoords.y + height - i * divisionSize + fontSize/3;
        numbersOnTheScale.push(
            <text
                key={i}
                x={centerX}
                y={centerY}
            >
                {i*divisionSize}
            </text>
        )
    }
    

    return (
        <g
            fontSize={fontSize}
            textAnchor='middle'
            fill='black'
        >
            {numbersOnTheScale.map((numberOnTheScale) => {
                return numberOnTheScale;
            })}
        </g>
    )
}