import React, {useEffect, useState} from 'react';
import L from "leaflet";
import DataLayer from "./dataLayer";
import {generateGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker,buildPopUpEquipmentContent} from "../helper/arenamap-style";

const AircraftLayer =()=>{
    const [data,setData] = useState(null);
    useEffect(()=>{
        generateGeoJSON('aircraft').then(setData);
    },[]);
    console.log('data', data);
    const pointToLayer = function(feature, latlng){
        return styleAssetMarker(feature, latlng);
    };
    const onEachFeature = function (feature, layer) {
        if (feature.properties) {
            // layer.bindPopup(buildPopUpEquipmentContent(feature));
            layer.bindPopup("aircraft pop up");

        }
    };
    return(
        <DataLayer data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
};


export default AircraftLayer;