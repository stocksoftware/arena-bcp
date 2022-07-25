import React, {useEffect, useState} from 'react';
import DataLayer from "./dataLayer";
import { generateGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker,buildPopUpEquipmentContent} from "../helper/arenamap-style";

const EquipmentLayer =()=>{
    const [data,setData] = useState(null);
    useEffect(()=>{
        generateGeoJSON('equipment').then(setData);
    },[]);
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