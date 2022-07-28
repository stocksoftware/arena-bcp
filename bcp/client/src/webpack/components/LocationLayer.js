import React from 'react';
import DataLayer from "./DataLayer";
import { toLocationGeoJSON} from "../helper/toLocationGeoJSON";
import { locationIcon, renderLocationPopup} from "../helper/map-style";
import {observer} from "mobx-react";
const LocationLayer =observer(()=>{
    const LocationGeoJSON = toLocationGeoJSON();
    const pointToLayer = function(feature, latlng){
        const icon = locationIcon(feature.properties);
        const marker = L.marker([latlng.lat, latlng.lng], { icon });
        return marker;
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', function(e){
            layer.bindPopup(renderLocationPopup(feature.properties),{ maxWidth: 600 })
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };
    return(
        <DataLayer data={LocationGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});

export default LocationLayer;