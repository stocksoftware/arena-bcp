import React, {useState} from "react";
import {getEquipmentCell, getPopUpContents} from '../helper/map-display';

const EquipmentAssetCol = ({asset, isDispatched}) => {
    const [showPopup, setShowPopup] = useState(false);
    console.log(asset)
    const {description, registration, operatorName} = getEquipmentCell(asset);
    const {lastSeen, operator} = getPopUpContents(asset);
    const {name, contact} = operator;

    return (
        <td className="assetColumn" onMouseOver={() => {
            setShowPopup(true);
        }} onMouseOut={() => {
            setShowPopup(false);
        }}>
            <div className="assetName">
                <span className="description">{description} </span>
                {registration &&
                    <div className="font_bold"><span className={isDispatched}>[{registration}]</span></div>}
            </div>
            <div className="operator">
                {operatorName}
            </div>
            {
               showPopup && (<div className='popup'>
                    <div className="content">

                        {lastSeen && <div>
                            <div className="label">Last Seen:</div>
                            {lastSeen}</div>}
                        {description && <div><span className="label">Description: </span> {description}</div>}
                        {asset.fuelType &&
                            <div>
                                <span className="label">Fuel Type:</span>
                                <span>{asset.fuelType}</span>
                            </div>
                        }
                        <div>
                            <div className="label">Operator:</div>
                            <div className="operator_detail">{name}</div>
                            <div className="operator_detail">{contact}</div>
                        </div>
                    </div>
                </div>)

            }
        </td>
    );
};

export default EquipmentAssetCol;