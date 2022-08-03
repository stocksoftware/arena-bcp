import React, {useState} from "react";
import {getAircraftCell, getPopUpContents} from '../helper/map-display';

const AircraftAssetCol = ({asset, isDispatched}) => {
    const [showPopup, setShowPopup] = useState(false);
    const {callsign, registration, operatorName} = getAircraftCell(asset);
    const {lastSeen, aircraftDetails, operator} = getPopUpContents(asset);
    const {category, makeAndModel, imageSrc} = aircraftDetails;
    const {name, contact} = operator;
    return (

        <td className="assetColumn" onMouseOver={() => {
            setShowPopup(true);
        }} onMouseOut={() => {
            setShowPopup(false);
        }}>
            <div className="assetName">
                <div className="description font_bold"><span className={isDispatched}>{callsign}</span></div>
                {!callsign && registration &&
                    <div className="font_bold"><span className={isDispatched}>[{registration}]</span></div>}
            </div>
            <div className="operator">
                {operatorName}
            </div>
            {
                showPopup && (<div className='popup'>
                    <div className="callsignAndRego">{callsign}{registration}</div>
                <div className="content">
                    {lastSeen && <div>
                        <div className="label">Last Seen:</div>
                        {lastSeen}</div>}
                    <span className="label">Type:</span>
                    <div>{category}</div>
                    <div>{makeAndModel}</div>
                    {imageSrc && <div><img src={imageSrc} className="image"/></div>}
                    <div>
                        <div className="label">Operator:</div>
                        <div>{name}</div>
                        <div>{contact}</div>
                    </div>
                </div>
                </div>)
            }
        </td>
    );
};

export default AircraftAssetCol;