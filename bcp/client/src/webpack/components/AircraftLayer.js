import React from 'react';
import DataLayer from "./DataLayer";
import {toGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker,buildPopUpAircraftContent} from "../helper/map-style";
import {observer} from "mobx-react";
const AircraftLayer =observer(()=>{
    const {aircraftGeoJSON} = toGeoJSON();
    const pointToLayer = function(feature, latlng){
        return styleAssetMarker(feature, latlng);
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', function(e){
            layer.bindPopup(buildPopUpAircraftContent(feature),{ maxWidth: 600 })
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };
    return(
        <DataLayer data={aircraftGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});

export default AircraftLayer;