import React, { useEffect, useState } from 'react';
import './App.css';
import { Map } from './components/map';
import { Location } from './util/location';
import { LocalExpert, HttpLocalExpert, LocalReport } from './local-expert/local-expert';
import { WellyInformation } from './components/welly-information/welly-information';


function App(): JSX.Element {

    const [localExpert] = useState<LocalExpert>(new HttpLocalExpert("/data"));
    const [location, setLocation] = useState<Location>();
    const [localReport, setLocalReport] = useState<LocalReport>();
    const [mapHeight, setMapHeight] = useState("70%");

    useEffect(() => {
        if (location === undefined) {
            return;
        }
        localExpert.localInformationAt(location)
            .then(response => {
                setLocalReport(response);
            })
    }, [location, localExpert]);

    useEffect(() => {
        if (location) {
            setMapHeight("50%");
        }

    }, [location]);

    const mapContainer = {height: mapHeight};

    return (
        <>
        <header>
            <div className='top-line'>
                <img src='logo512.png' className="logo" alt='A black welly'/>
                <div className='title single-line-text'>
                    <h1>Do I need wellies?</h1>
                </div>
                <div className="banner single-line-text">Work in progress!</div>
            </div>
        </header>
        {/* <div className='tagline'>
            <p>A website to tell people whether they need to wear wellies on country walks anywhere in England.</p>
        </div> */}
        <div className='map-container' style={mapContainer} >
        <Map location={location} setLocation={setLocation}/>
        </div>
        <div className='welly-information' >
            {/* <div style={{width: 'fit-content'}} > */}
            {localReport ? <WellyInformation localReport={localReport}/> : <p>Select a location on the map to find out if you need wellies</p>}
            {/* </div> */}
        </div>
        </>
    );
}

export default App;
