import React, { useEffect, useState } from 'react'
// import { useEffect, useState } from "react";
// import { Rainfall } from "../../util/rain/rainfall/rainfall";
import { LocalReport } from "../../local-expert/local-expert";
import './welly-information.css';
// import { WellyNecessityRating } from "../../local-expert/local-expert";
import { RainfallGraph } from "./rainfall-graph";
import { Rainfall } from '../../util/rain/rainfall/rainfall';
import { WellyAssessment } from './welly-assessment';


interface WellyInformationProps {
    localReport: LocalReport;
}

export function WellyInformation({localReport}: WellyInformationProps): JSX.Element {
    const weatherReport = localReport.weather()

    const [rainfallAmount, setRainfallAmount] = useState<Rainfall>()

    useEffect(() => {
        setRainfallAmount(undefined);
    }, [localReport]);

    return (
        <>
        <div className="welly-assessment">
            <WellyAssessment localReport={localReport}/>
        </div>
            {/* <div className="surroundingBox">
                <WellyOMeter wellyNecessityAssessment={wellyNecessityAssessment}/>                
                <div className="container">
                    <div className="start-of-meter">No need for wellies</div>
                    <div className="end-of-meter">Definitely need wellies</div>
                    </div>
                </div> */}
        <div style={{display: JSON.stringify(weatherReport.dailyTotalRainfall) !== "[]"? "block" : "none"}}>
            {/* <div className="surroundingBox"> */}
            <p className='graph-title'>The amount of rainfall (mm) against the date.</p>
                <div className='graph'>
                    <RainfallGraph dailyRainfall={weatherReport.dailyTotalRainfall} setRainfallAmount={setRainfallAmount}/>
                </div>
            {rainfallAmount?
                <p className='rainfall-information'>{"Rainfall on " + rainfallAmount.fellOn.toDateString() + " was " + rainfallAmount.amount.millimetres.toFixed(0) + " mm"}</p> :
                // <p className='rainfall-information'>{"Total rainfall is " + weatherReport.dailyTotalRainfall.reduce((total, rainfall) => {return rainfall.amount.millimetres + total}, 0).toFixed(0) + " mm"}</p>
                null
            }
            {/* </div> */}
        </div>
        <p className='EnvironmentAgencyAttribution'>This uses Environment Agency rainfall data from the real-time data API (Beta)</p>
        </>

    )
}

// function RainfallGraph(props: {dailyRainfall: Rainfall[]}) {    
    
//     const dailyRainfall = props.dailyRainfall;

//     const [rainfallAmount, setRainfallAmount] = useState<Rainfall>()

//     const thirtyDaysAgo = - 30;
    
//     const monthOfRainfall = props.dailyRainfall.filter(rainfall => 
//         rainfall.fellOn > createDate(thirtyDaysAgo)
//     ).sort((a: Rainfall, b: Rainfall) => {
//         if (a.fellOn > b.fellOn) {
//             return 1;
//         }
//         return -1;
//     }
//     );
//     function createDate(daysAgo: number) {
//         const today = new Date();
//         return new Date(today.getTime() + daysAgo * 24 * 60 * 60 * 1000);
//     }

//     useEffect(() => {
//         setRainfallAmount(undefined);
//     }, [dailyRainfall]);


//     const horizontalLineStyle = {
//         // width: (monthOfRainfall.length*17 + 6) + "px",
//         width: "fit-content",
//     }

//     const graphHeight = getMaxRainfall(monthOfRainfall).amount.millimetres + 30;
//     return (
//         <>
//         <p className="graph-title">Daily Rainfall over the Past Month</p>
//         <p className="graph-scales">Rainfall (mm) against Date</p>
//         <Scale height={graphHeight} />
//         <VerticalLine height={graphHeight}/>
//         <div className="buffered horizontal-line" style={horizontalLineStyle} >
//         <RainfallBarGraph monthOfRainfall={monthOfRainfall} setRainfallAmount={setRainfallAmount}/>
//         </div>      
//         <Dates monthOfRainfall={monthOfRainfall} />
//         {rainfallAmount? <p className="amount-of-rainfall-information">{"On " + rainfallAmount.fellOn.toDateString() + " there was " + rainfallAmount.amount.millimetres.toFixed(1) + " mm of rainfall."}</p> : <p className="amount-of-rainfall-information">{"There was " +  dailyRainfall.reduce((totalAmountOfRainfall, rainfall) => {return totalAmountOfRainfall + rainfall.amount.millimetres}, 0).toFixed(1) + " mm of Rainfall Total over the past month."}</p>}
//         </>

//     );


// }

// function VerticalLine(props: {height: number}) {
    
//     const height = props.height;

//     const verticalLineStyle = {
//         height: height + "px",
//     };

//     return (
//         <>  
//             <div className="buffered vertical-line" style={verticalLineStyle}/>
//         </>
//     )
// }



// function Scale(props: {height: number}) {
//     const height = props.height;
//     const scale = 20;
//     const X = Math.ceil(height / scale);
//     const scaleNumbers: JSX.Element[] = [];

//     for (let i = 0; i < X; i++) {
//         scaleNumbers.push(<p className="scale-label" key={i}>{i * scale}</p>);
//     }

//     scaleNumbers.reverse();

//     return (
//         <div className="scale" style={{ height: height + "px" }}>
//             {scaleNumbers.map((scaleNumber) => {
//                 return scaleNumber;
//             })}
//         </div>
//     );

// }

// function getMaxRainfall(monthOfRainfall: Rainfall[]) {
//     return monthOfRainfall.reduce((mostRainfall, rainfall) => { return rainfall.amount.millimetres > mostRainfall.amount.millimetres ? rainfall : mostRainfall; });
// }

// function Dates(props: {monthOfRainfall: Rainfall[]}) {
//     return (
//         <>
//         <div className="buffered dates">
//         {props.monthOfRainfall.map((rainfall, index) => {
//             const date = rainfall.fellOn.getDate();
//             if (date > 9) {
//                 return (
//                     <>
//                     <p className="date" key={index}>{rainfall.fellOn.getDate()}</p>
//                     </>
//                 )
//             }
//             return (
//                 <>
//                 <p className="single-digit date" key={index}>{rainfall.fellOn.getDate()}</p>
//                 </>
//             )

//         })}
//         </div>
//         </>
//     )
// }

// function RainfallBarGraph(props: {monthOfRainfall: Rainfall[], setRainfallAmount: Function}) {
//     return (
//         <>
//         {props.monthOfRainfall.map((rainfall, index) => {
//             return (
//                 <>
//                 <RainfallBar rainfall={rainfall} keyValue={index} setRainfallAmount={props.setRainfallAmount}/>
//                 </>
//             )
//         })}
//         </>
//     )
// }

// function RainfallBar(props: {rainfall: Rainfall, keyValue: number, setRainfallAmount: Function}) {
//     const [barColor, setBarColor] = useState("blue");
    
//     const rainfallBar = {
//         height: props.rainfall.amount.millimetres + 'px',
//         backgroundColor: barColor,
//     };
    
//     function changeBarBackToBlueAfterDelay() {
//         setTimeout(() => {
//             setBarColor("Blue")
//         }, 500);
//     }

//     const handleClick = () => {
//         props.setRainfallAmount(props.rainfall);
//         setBarColor("red");
//         changeBarBackToBlueAfterDelay();
//     }



//     return (
//         <>
//         <div className="rainfall-bar" style={rainfallBar} key={props.keyValue} onClick={handleClick}/>
//         </>
//     )
// }



// function WellyOMeter(props: {wellyNecessityAssessment: WellyNecessityRating}) {
//     // Bar that goes across the screen
    
//     const meterStyle = {
//         height: '100px',
//         width: ((props.wellyNecessityAssessment.necessityRating/props.wellyNecessityAssessment.maxRating)*100).toString() + '%',
//         backgroundColor: 'green'
//     };

//     return (
//         <div>
//             <div style={meterStyle}/>
//         </div>
//     )
// }
