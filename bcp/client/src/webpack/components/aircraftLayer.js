import React, {useEffect} from 'react';
import DataLayer from "./dataLayer";
import { generateGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker,buildPopUpEquipmentContent} from "../helper/map-style";
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
import {Popup} from 'react-leaflet';
const AircraftLayer =observer(()=>{
    const {mapStore} = useStores();
    const {aircraftGeoJSON } = mapStore;
    const pointToLayer = function(feature, latlng){
        return styleAssetMarker(feature, latlng);
    };
    const onEachFeature = function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup("hello I am popup");
        }
    };
    return(
        <DataLayer data={aircraftGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});


export default AircraftLayer;