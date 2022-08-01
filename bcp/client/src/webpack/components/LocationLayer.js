import React, {useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import { fetchLocations} from "../helper/toGeoJSON";
import { locationIcon, renderLocationPopup} from "../helper/map-style";
import {observer} from "mobx-react";
const LocationLayer =observer( ()=>{
    const [data, setData] = useState(null);
    useEffect(()=>{
        fetchLocations().then(setData);
    },[]);
    const pointToLayer = function(feature, latlng){
        const icon = locationIcon(feature.properties);
        return L.marker([latlng.lat, latlng.lng], { icon });
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', function(e){
            layer.bindPopup(renderLocationPopup(feature.properties),{ maxWidth: 600 });
        });
    };
    return(
        <DataLayer data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});

export default LocationLayer;