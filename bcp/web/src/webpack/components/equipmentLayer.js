import React, {useEffect, useState} from 'react';
import L from "leaflet";
import DataLayer from "./dataLayer";
import {generateEquipmentGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker,buildPopUpEquipmentContent} from "../helper/arenamap-style";

const EquipmentLayer =()=>{
    const [data,setData] = useState(null);
    useEffect(()=>{
        generateEquipmentGeoJSON().then(setData);
    },[]);
    console.log('data', data);
    const pointToLayer = function(feature, latlng){
        return styleAssetMarker(feature, latlng);
    };
    const onEachFeature = function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(buildPopUpEquipmentContent(feature));
        }
    };
    return(
        <DataLayer data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
};


export default EquipmentLayer;