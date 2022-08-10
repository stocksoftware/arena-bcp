import React, {useState} from "react";
import {getAircraftCell, getPopUpContents} from '../helper/map-display';

const AircraftAssetCol = ({asset, status}) => {
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
                <div className="description font_bold"><span className={status}>{callsign}</span></div>
                {!callsign && registration &&
                    <div className="font_bold"><span className={status}>[{registration}]</span></div>}
            </div>
            <div className="operator">
                {operatorName}
            </div>
            {
                showPopup && (<div className='popup'>
                    <div className="callsignAndRego">{callsign}{registration && callsign ? <span>[{registration}]</span> :
                        <span>{registration}</span>}</div>
                    <div className="content">
                        {lastSeen && <div>
                            <div className="label">Last Seen:</div>
                            {lastSeen}</div>}
                        <div className="label">Type:</div>
                        <div className="detail">{category}</div>
                        <div className="detail">{makeAndModel}</div>
                        {imageSrc && <div className="detail"><img src={imageSrc} className="image"/></div>}
                        <div>
                            <div className="label">Operator:</div>
                            <div className="detail">{name}</div>
                            <div className="detail">{contact}</div>
                        </div>
                    </div>
                </div>)
            }
        </td>
    );
};

export default AircraftAssetCol;
