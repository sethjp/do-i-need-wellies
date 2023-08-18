import React from 'react';
import { LocalReport } from '../../local-expert/local-expert';

interface WellyAssessmentProps {
    localReport: LocalReport;
}

export function WellyAssessment({localReport}: WellyAssessmentProps) {
    let message: string;

    const weatherReport = localReport.weather();
    const necessityRating = localReport.doINeedWellies().necessityRating;

    if (JSON.stringify(weatherReport.dailyTotalRainfall) === "[]") {
        message = "You've selected a location outside of England";
    } else if (necessityRating > 0) {
        message = "You should wear wellies";
    } else {
        message = "You don't need to wear wellies";
    }
    
    return (
        <>
        <h2>{message}</h2>
        </>
    )
}